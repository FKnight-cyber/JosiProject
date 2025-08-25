import { PurchaseRequest } from "../dtos/purchaseDtos";
import { PurchaseCreationDTO, PaymentRequest } from "../dtos/purchaseDtos";
import productRepository from "../repositories/productRepository";
import clienteRepository from "../repositories/clienteRepository";
import purchaseRepository from "../repositories/purchaseRepository";
import advanceService from "./advanceService";

// Interface para compra com informações adicionais
interface PurchaseWithDetails {
  id: number;
  clientId: number;
  forma: string[];
  detalhe: string[];
  valor: number[];
  wasPaid: boolean;
  valorAdiantamentos: number;
  status: string;
  createdAt: Date;
  produtos?: any[];
  valorTotal?: number;
  totalAdiantamentosPendentes?: number;
}

async function insert(data: PurchaseRequest[], id:number) {
  // Calcular o valor total dos produtos
  let valorTotalProdutos = 0;
  for(const product of data) {
    valorTotalProdutos += Number(product.price) * Number(product.quantity);
  }

  // Criar a compra inicialmente sem adiantamentos
  const clientData:PurchaseCreationDTO = {
    clientId: id,
    valorAdiantamentos: 0,
    status: "PENDENTE"
  };

  const purchase = await purchaseRepository.insert(clientData);
  const purchaseId = purchase.id;

  // Registrar os produtos
  for(const product of data) {
    const productId = (await productRepository.getByName(product.name)).id;

    const registerData = {
      productId,
      purchaseId,
      price: Number(product.price),
      quantity: Number(product.quantity)
    }

    await purchaseRepository.registerBoughtProduct(registerData);
  }

  // Aplicar adiantamentos automaticamente
  const advanceResult = await advanceService.applyAdvancesToPurchase(id, purchaseId, valorTotalProdutos);
  
  // Preparar dados para atualização da compra
  const updateData: any = {
    valorAdiantamentos: advanceResult.valorAdiantamentos,
    status: advanceResult.status,
    wasPaid: advanceResult.status === "CONCLUIDO"
  };
  
  if (advanceResult.valorAdiantamentos > 0) {
    updateData.forma = {
      set: ["Débito Automático"]
    };
    updateData.detalhe = {
      set: ["Pagamento referente a adiantamento do cliente"]
    };
    updateData.valor = {
      set: [advanceResult.valorAdiantamentos]
    };
  }
  

  await purchaseRepository.updatePurchase(purchaseId, updateData);
};

async function getPurchases(id:number, page:number = 1, limit:number = 20, status?:string): Promise<{purchases: PurchaseWithDetails[], total: number, totalPages: number, currentPage: number}> {
  let purchases;
  let total;
  
  if (status && status !== 'all') {
    // Se há filtro de status específico (pending/completed), buscar todas as compras para filtrar corretamente
    purchases = await purchaseRepository.getPurchasesByClientId(id);
    total = purchases.length;
  } else {
    // Sem filtro de status ou status = 'all', usar paginação normal
    const offset = (page - 1) * limit;
    purchases = await purchaseRepository.getPurchasesByClientIdPaginated(id, limit, offset);
    // Sempre buscar o total real de compras do cliente
    total = await purchaseRepository.getTotalPurchasesByClientId(id);
  }
  
  const purchasesWithDetails: PurchaseWithDetails[] = [];
  
  // Para cada compra, incluir produtos e calcular valor total
  for (const purchase of purchases) {
    // Incluir os produtos da compra para calcular o valor total
    const produtos = await purchaseRepository.getClientPurchases(purchase.id);
    
    // Calcular o valor total da compra (apenas produtos)
    let valorTotal = 0;
    produtos.forEach(produto => {
      valorTotal += produto.price * produto.quantity;
    });
    
    // Buscar o total de adiantamentos pendentes do cliente
    const totalAdiantamentosPendentes = await advanceService.calculatePendingAdvances(id);
    
    const purchaseWithDetails: PurchaseWithDetails = {
      ...purchase,
      produtos: produtos,
      valorTotal: valorTotal,
      totalAdiantamentosPendentes: totalAdiantamentosPendentes
    };
    
    purchasesWithDetails.push(purchaseWithDetails);
  }
  
  // Aplicar filtro de status baseado no campo status do banco
  let filteredPurchases = purchasesWithDetails;
  let totalFiltered = total; // Inicialmente, usar o total real
  
  if (status === 'pending') {
    filteredPurchases = purchasesWithDetails.filter(p => p.status === "PENDENTE");
    // Para filtros específicos, recalcular o total baseado no filtro
    totalFiltered = filteredPurchases.length;
  } else if (status === 'completed') {
    filteredPurchases = purchasesWithDetails.filter(p => p.status === "CONCLUIDO");
    // Para filtros específicos, recalcular o total baseado no filtro
    totalFiltered = filteredPurchases.length;
  }
  
  // Aplicar paginação se necessário
  let finalPurchases = filteredPurchases;
  
  if (status && status !== 'all') {
    // Aplicar paginação manualmente após filtrar
    const offset = (page - 1) * limit;
    finalPurchases = filteredPurchases.slice(offset, offset + limit);
  } else if (status === 'all' || !status) {
    // Se não há filtro de status específico, a paginação já foi aplicada no repository
    finalPurchases = filteredPurchases;
  }
  
  const totalPages = Math.ceil(totalFiltered / limit);
  
  return {
    purchases: finalPurchases,
    total: totalFiltered,
    totalPages,
    currentPage: page
  };
};

async function getPurchasesByDate(id:number, initial:string, final:string, page:number = 1, limit:number = 20, status?:string): Promise<{purchases: PurchaseWithDetails[], total: number, totalPages: number, currentPage: number}> {
  // Criar datas em UTC para evitar problemas de timezone
  const initialDate = new Date(formatStringData(initial) + 'T00:00:00.000Z');
  const finalDate = new Date(formatStringData(final) + 'T23:59:59.999Z');
  
  let purchases;
  let total;
  
  if (status && status !== 'all') {
    // Se há filtro de status específico (pending/completed), buscar todas as compras do período para filtrar corretamente
    purchases = await purchaseRepository.getClientPurchasesByDate(id, initialDate, finalDate);
    total = purchases.length;
  } else {
    // Sem filtro de status ou status = 'all', usar paginação normal
    const offset = (page - 1) * limit;
    purchases = await purchaseRepository.getClientPurchasesByDatePaginated(id, initialDate, finalDate, limit, offset);
    // Sempre buscar o total real de compras do cliente no período
    total = await purchaseRepository.getTotalPurchasesByClientIdAndDate(id, initialDate, finalDate);
  }
  
  const purchasesWithDetails: PurchaseWithDetails[] = [];
  
  // Para cada compra, incluir produtos e calcular valor total
  for (const purchase of purchases) {
    // Incluir os produtos da compra para calcular o valor total
    const produtos = await purchaseRepository.getClientPurchases(purchase.id);
    
    // Calcular o valor total da compra (apenas produtos)
    let valorTotal = 0;
    produtos.forEach(produto => {
      valorTotal += produto.price * produto.quantity;
    });
    
    // Buscar o total de adiantamentos pendentes do cliente
    const totalAdiantamentosPendentes = await advanceService.calculatePendingAdvances(id);
    
    const purchaseWithDetails: PurchaseWithDetails = {
      ...purchase,
      produtos: produtos,
      valorTotal: valorTotal,
      totalAdiantamentosPendentes: totalAdiantamentosPendentes
    };
    
    purchasesWithDetails.push(purchaseWithDetails);
  }

  // Aplicar filtro de status baseado no campo status do banco
  let filteredPurchases = purchasesWithDetails;
  let totalFiltered = total; // Inicialmente, usar o total real
  
  if (status === 'pending') {
    filteredPurchases = purchasesWithDetails.filter(p => p.status === "PENDENTE");
    // Para filtros específicos, recalcular o total baseado no filtro
    totalFiltered = filteredPurchases.length;
  } else if (status === 'completed') {
    filteredPurchases = purchasesWithDetails.filter(p => p.status === "CONCLUIDO");
    // Para filtros específicos, recalcular o total baseado no filtro
    totalFiltered = filteredPurchases.length;
  }

  // Aplicar paginação se necessário
  let finalPurchases = filteredPurchases;
  
  if (status && status !== 'all') {
    // Aplicar paginação manualmente após filtrar
    const offset = (page - 1) * limit;
    finalPurchases = filteredPurchases.slice(offset, offset + limit);
  } else if (status === 'all' || !status) {
    // Se não há filtro de status específico, a paginação já foi aplicada no repository
    finalPurchases = filteredPurchases;
  }

  const totalPages = Math.ceil(totalFiltered / limit);

  return {
    purchases: finalPurchases,
    total: totalFiltered,
    totalPages,
    currentPage: page
  };
};

async function getPurchaseInfo(id:number) {
  const purchase = await purchaseRepository.getPurchaseById(id);
  const cliente = await clienteRepository.clientById(purchase.clientId);
  const purchases = await purchaseRepository.getClientPurchases(id);

  const data = {
    fornecedor: cliente.name,
    data: purchase.createdAt,
    formas: purchase.forma,
    detalhes: purchase.detalhe,
    valores: purchase.valor,
    wasPaid: purchase.wasPaid,
    status: purchase.status,
    valorAdiantamentos: purchase.valorAdiantamentos,
    produtos: purchases
  }

  // Calcular valor restante: produtos - adiantamentos - pagamentos
  const valorProdutos = data.produtos.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalPagamentos = data.valores.reduce((sum, valor) => sum + valor, 0);
  const valorRestante = valorProdutos - (data.valorAdiantamentos || 0) - totalPagamentos;
  
  // Determinar status baseado no valor restante
  data.wasPaid = valorRestante <= 0;
  data.status = valorRestante <= 0 ? "CONCLUIDO" : "PENDENTE";

  return data;
};

async function payment(data:PaymentRequest, id:number) {
  const purchase = await purchaseRepository.getPurchaseById(id);

  // Primeiro adicionar o novo pagamento
  purchase.forma.push(data.forma);
  purchase.detalhe.push(data.detalhe);
  purchase.valor.push(Number(data.valor));


  // Calcular o valor restante manualmente
  const produtos = await purchaseRepository.getClientPurchases(id);
  let valorTotalProdutos = 0;
  produtos.forEach(produto => {
    valorTotalProdutos += produto.price * produto.quantity;
  });

  // Calcular valor restante: produtos - adiantamentos - pagamentos
  const totalPagamentos = purchase.valor.reduce((sum, valor) => sum + valor, 0);
  const valorRestante = valorTotalProdutos - (purchase.valorAdiantamentos || 0) - totalPagamentos;
  
  if(valorRestante <= 0) {
    purchase.wasPaid = true;
    purchase.status = "CONCLUIDO";
    
    // Se o valor restante for negativo, criar um adiantamento para o cliente
    if (valorRestante < 0) {
      const valorAdiantamento = Math.abs(valorRestante); // Converter negativo para positivo
      
      // Registrar o adiantamento
      await advanceService.register({
        clientId: purchase.clientId,
        valor: valorAdiantamento,
        descricao: `Adiantamento gerado automaticamente do pagamento da compra ${purchase.id} - ${data.forma}`
      });
    }
  }

  // Salvar todas as mudanças no banco de dados
  await purchaseRepository.addPayment(purchase);
};

async function getTransactions(id:number, initial:string, final:string) {
  // Criar datas em UTC para evitar problemas de timezone
  const initialDate = new Date(formatStringData(initial) + 'T00:00:00.000Z');
  const finalDate = new Date(formatStringData(final) + 'T23:59:59.999Z');

  const data = {};

  const purchases:any = await purchaseRepository.getClientPurchasesByDate(id, initialDate, finalDate);

  for(const purchase of purchases) {
    const info =  await purchaseRepository.getClientPurchases(purchase.id);
    purchase.product = info;
  }

  for(const purchase of purchases) {
    for(let i = 0; i < purchase.product.length;i++) {
      if(data[purchase.product[i].produto.nome + " " + purchase.product[i].produto.medida]) {
        data[purchase.product[i].produto.nome + " " + purchase.product[i].produto.medida] += purchase.product[i].quantity
      } else {
        data[purchase.product[i].produto.nome + " " + purchase.product[i].produto.medida] = purchase.product[i].quantity
      }
    }
  }

  return getSortedHash(data);
}

async function getStockInfo(initial:string, final:string) {
  // Criar datas em UTC para evitar problemas de timezone
  const initialDate = new Date(formatStringData(initial) + 'T00:00:00.000Z');
  const finalDate = new Date(formatStringData(final) + 'T23:59:59.999Z');

  const data = {};

  const clientes = await clienteRepository.getClients();

  for(const cliente of clientes) {
    const purchases:any = await purchaseRepository.getClientPurchasesByDate(cliente.id, initialDate, finalDate);

    for(const purchase of purchases) {
      const info =  await purchaseRepository.getClientPurchases(purchase.id);
      purchase.product = info;
    }
  
    for(const purchase of purchases) {
      for(let i = 0; i < purchase.product.length;i++) {
        if(data[purchase.product[i].produto.nome + " " + purchase.product[i].produto.medida]) {
          data[purchase.product[i].produto.nome + " " + purchase.product[i].produto.medida] += purchase.product[i].quantity
        } else {
          data[purchase.product[i].produto.nome + " " + purchase.product[i].produto.medida] = purchase.product[i].quantity
        }
      }
    }
  }
 
  return getSortedHash(data);
}

async function remove(id:number) {
  await purchaseRepository.removePurchase(id);
}

const purchaseServices = {
  insert,
  remove,
  getPurchaseInfo,
  getPurchases,
  getPurchasesByDate,
  getTransactions,
  payment,
  getStockInfo
};

function calculateTotal(purchases:any) {
  let soma = 0;
  let soma2 = 0;

  if(purchases.valores.length === 0) {
    soma2 = 0;
  }else {
    purchases.valores.map(value => {
      soma2 += value;
    })
  }

  purchases.produtos.map(e => {
    soma += e.price * e.quantity;
  });

  return soma - soma2;
}

function calculateTotalWithAdiantamentos(purchases:any) {
  let soma = 0;
  let soma2 = 0;

  if(purchases.valores.length === 0) {
    soma2 = 0;
  }else {
    purchases.valores.map(value => {
      soma2 += value;
    })
  }

  purchases.produtos.map(e => {
    soma += e.price * e.quantity;
  });

  // Calcular valor restante: produtos - adiantamentos - pagamentos
  const valorRestante = soma - (purchases.valorAdiantamentos || 0) - soma2;
  
  return valorRestante;
}

function formatStringData(data:string) {
  // Verificar se a data já está no formato yyyy-mm-dd (do input date)
  if (data.includes('-')) {
    return data; // Já está no formato correto
  }
  
  // Formato dd/mm/yyyy (formato antigo)
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano + '-' + ("0"+mes).slice(-2) + '-' + ("0"+dia).slice(-2);
}

function getSortedHash(inputHash){
  var resultHash = {};

  var keys = Object.keys(inputHash);
  keys.sort(function(a, b) {
    return inputHash[a] - inputHash[b]
  }).reverse().forEach(function(k) {
    resultHash[k] = inputHash[k];
  });
  return resultHash;
}

export default purchaseServices;