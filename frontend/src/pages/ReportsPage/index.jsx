// @ts-ignore
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Container, Purchase } from "./style";
import axios from "axios";
import { 
  Tooltip, 
  IconButton, 
  Box
} from "@mui/material";
import { Warning } from "@mui/icons-material";

export default function ReportsPage() {
  const [info, setInfo] = useState();
  const [purchases, setPurchases] = useState();
  const [adiantamentos, setAdiantamentos] = useState();
  const [adiantamentosAteDataCompra, setAdiantamentosAteDataCompra] = useState();
  const [cliente, setCliente] = useState();
  const [valorAdiantamento, setValorAdiantamento] = useState(0);
  const [isPdfExport, setIsPdfExport] = useState(false);

  const { purchaseId } = useParams();

  useEffect(() => {
    // Detectar se é uma exportação PDF
    const checkIfPdfExport = () => {
      // Verificar se é uma impressão ou exportação PDF
      const isPrinting = window.matchMedia && window.matchMedia('print').matches;
      const isPdfExport = isPrinting || window.location.search.includes('pdf=true');
      setIsPdfExport(isPdfExport);
    };

    // Verificar na inicialização
    checkIfPdfExport();

    // Listener para mudanças de mídia (impressão)
    const mediaQuery = window.matchMedia('print');
    const handleMediaChange = (e) => {
      setIsPdfExport(e.matches);
    };

    mediaQuery.addListener(handleMediaChange);

    // Cleanup
    return () => {
      mediaQuery.removeListener(handleMediaChange);
    };
  }, []);

  useEffect(() => {
    const promise = axios.get(`${import.meta.env.VITE_URL}/clients/purchases/${purchaseId}`);

    promise.then(res => {
      setPurchases(res.data);
      
      if (res.data && res.data.valorAdiantamentos !== undefined && res.data.valorAdiantamentos !== null) {
        setValorAdiantamento(res.data.valorAdiantamentos);
      } else {
        setValorAdiantamento(0);
      }
      
      // Buscar dados do cliente
      let clientId = null;
      
      if (res.data && res.data.cliente) {
        setCliente(res.data.cliente);
        clientId = res.data.cliente.id;
      } else if (res.data && res.data.clientId) {
        clientId = res.data.clientId;
      } else if (res.data && res.data.clienteId) {
        clientId = res.data.clienteId;
      }
      
      if (clientId) {
        buscarAdiantamentos(clientId);
        
        if (res.data && res.data.data) {
          buscarAdiantamentosAteDataCompra(clientId, res.data.data);
        }
      } else {
        const urlParts = window.location.pathname.split('/');
        const clientIdFromUrl = urlParts[2];
        if (clientIdFromUrl && !isNaN(clientIdFromUrl)) {
          buscarAdiantamentos(parseInt(clientIdFromUrl));
          
          if (res.data && res.data.data) {
            buscarAdiantamentosAteDataCompra(parseInt(clientIdFromUrl), res.data.data);
          }
        }
      }
    });

    const promise2 = axios.get(`${import.meta.env.VITE_URL}/info`);

    promise2.then(res => {
      setInfo(res.data);
    })

  },[]);

  async function buscarAdiantamentos(clientId) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL}/advances/client/${clientId}`);
      setAdiantamentos(response.data);
    } catch (error) {
      setAdiantamentos([]);
    }
  }

  async function buscarAdiantamentosAteDataCompra(clientId, dataCompra) {
    try {
      const dataFormatada = new Date(dataCompra).toISOString();
      const url = `${import.meta.env.VITE_URL}/advances/client/${clientId}/until-date?date=${dataFormatada}`;
      const response = await axios.get(url);
      setAdiantamentosAteDataCompra(response.data);
    } catch (error) {
      setAdiantamentosAteDataCompra([]);
    }
  }

  function calcularTotalAdiantamentosAteDataCompra() {
    if (!adiantamentosAteDataCompra || adiantamentosAteDataCompra.length === 0) {
      return 0;
    }

    const total = adiantamentosAteDataCompra.reduce((total, adiantamento) => {
      return total + adiantamento.valor;
    }, 0);

    return total;
  }

  function calculateTotals() {
    if (!purchases || !purchases.produtos || !Array.isArray(purchases.produtos)) {
      return { measures: {}, totalValue: 0 };
    }
    
    let measures = {};
    let totalValue = 0;

    purchases.produtos.forEach(produto => {
      if (!produto || !produto.produto) return;
      
      const medida = produto.produto.medida ? produto.produto.medida.toLowerCase() : 'un';
      const quantidade = Number(produto.quantity) || 0;
      const preco = Number(produto.price) || 0;
      
      if (!measures[medida]) {
        measures[medida] = 0;
      }
      measures[medida] += quantidade;
      
      totalValue += preco * quantidade;
    });

    return { measures, totalValue };
  }

  function formatMeasures(measures) {
    if (!measures || Object.keys(measures).length === 0) {
      return 'Nenhum produto';
    }
    
    return Object.entries(measures)
      .map(([medida, quantidade]) => {
        const medidaFormatada = medida.charAt(0).toUpperCase() + medida.slice(1);
        return `${quantidade} ${medidaFormatada}`;
      })
      .join(' / ');
  }

  function renderProducts() {
    const totals = calculateTotals();
    
    return (
      <>
        {purchases.produtos.map((produto, index) =>
           <Purchase key={index}>
              <div className="left">
                <h5>{index + 1}</h5>
                <h5>{produto.produto?.nome}</h5>
                <h5 className="move">{produto.quantity} {produto.produto.medida}</h5>
                <h5 className="move">{(produto.price).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
                <h5 className="move">{(produto.price * produto?.quantity).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
              </div>
           </Purchase>
        )}
        {purchases.produtos.length > 0 && (
          <Purchase className="total-row">
            <div className="left">
              <h5>Total:</h5>
              <h5></h5>
              <h5 className="move">{formatMeasures(totals.measures)}</h5>
              <h5 className="move"></h5>
              <h5 className="move">{totals.totalValue.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
            </div>
          </Purchase>
        )}
      </>
    )
  }

  function renderInfo() {
    let result = [];

    for(let i = 0; i < purchases.valores.length;i++) {
      result.push(<Purchase key={i}>
      <div className="right">
        <h5>{purchases.formas[i]}</h5>
        <h5 className="detalhes">{purchases.detalhes[i]}</h5>
        <h5>{purchases.valores[i].toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h5>
      </div>
   </Purchase>)
    }
    return result;
  }

  function calculateTotal() {
    if (!purchases) return ["R$ 0,00", "R$ 0,00", "R$ 0,00"];

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

    // Verificar se há adiantamentos pendentes
    const totalAdiantamentos = calcularTotalAdiantamentosAteDataCompra();
    
    // Lógica corrigida para o cálculo do saldo final
    let saldoFinal;
    
    // Se há adiantamentos aplicados nesta compra (valorAdiantamento > 0)
    if (valorAdiantamento > 0) {
      // Os adiantamentos aplicados já estão incluídos nos pagamentos (soma2)
      // Mas precisamos considerar os adiantamentos pendentes restantes
      const adiantamentosRestantes = totalAdiantamentos - valorAdiantamento;
      
      if (adiantamentosRestantes > 0) {
        // Se ainda há adiantamentos pendentes após a aplicação
        // Saldo = valor dos produtos - pagamentos - adiantamentos restantes
        saldoFinal = soma - soma2 - adiantamentosRestantes;
      } else {
        // Se não há adiantamentos pendentes restantes
        saldoFinal = soma - soma2;
      }
    } else {
      // Se não há adiantamentos aplicados nesta compra
      if (totalAdiantamentos === 0) {
        // Se não há adiantamentos pendentes: valor dos produtos - pagamentos
        saldoFinal = soma - soma2;
      } else {
        // Se há adiantamentos pendentes, verificar se foram criados por excesso de pagamento
        const valorExcedente = Math.max(0, soma2 - soma);
        
        if (valorExcedente > 0 && totalAdiantamentos === valorExcedente) {
          // Se os adiantamentos foram criados por excesso de pagamento, não contar duas vezes
          saldoFinal = soma - soma2;
        } else {
          // Se há adiantamentos pré-existentes: valor dos produtos - (adiantamentos + pagamentos)
          saldoFinal = soma - (totalAdiantamentos + soma2);
        }
      }
    }

    
    // Logs adicionais para debug dos adiantamentos restantes
    if (valorAdiantamento > 0) {
      const adiantamentosRestantes = totalAdiantamentos - valorAdiantamento;
    }

    return [
      soma.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}),
      soma2.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}),
      saldoFinal.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})
    ];
  }

  function getValorRestante() {
    if (!purchases) return 0;
    
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

    // Verificar se há adiantamentos pendentes
    const totalAdiantamentos = calcularTotalAdiantamentosAteDataCompra();
    
    // Lógica corrigida para o cálculo do saldo final
    if (valorAdiantamento > 0) {
      // Se há adiantamentos aplicados nesta compra
      // Os adiantamentos aplicados já estão incluídos nos pagamentos (soma2)
      // Mas precisamos considerar os adiantamentos pendentes restantes
      const adiantamentosRestantes = totalAdiantamentos - valorAdiantamento;
      
      if (adiantamentosRestantes > 0) {
        // Se ainda há adiantamentos pendentes após a aplicação
        return soma - soma2 - adiantamentosRestantes;
      } else {
        // Se não há adiantamentos pendentes restantes
        return soma - soma2;
      }
    } else {
      // Se não há adiantamentos aplicados nesta compra
      if (totalAdiantamentos === 0) {
        // Se não há adiantamentos pendentes: valor dos produtos - pagamentos
        return soma - soma2;
      } else {
        // Se há adiantamentos pendentes, verificar se foram criados por excesso de pagamento
        const valorExcedente = Math.max(0, soma2 - soma);
        
        if (valorExcedente > 0 && totalAdiantamentos === valorExcedente) {
          // Se os adiantamentos foram criados por excesso de pagamento, não contar duas vezes
          return soma - soma2;
        } else {
          // Se há adiantamentos pré-existentes: valor dos produtos - (adiantamentos + pagamentos)
          return soma - (totalAdiantamentos + soma2);
        }
      }
    }
  }

  function renderAdiantamentoAlert() {
    const totalAdiantamentos = calcularTotalAdiantamentosAteDataCompra();
    
    // Mostrar o ícone se há adiantamentos pendentes e não é exportação PDF
    if (totalAdiantamentos > 0 && !isPdfExport) {
      const tooltipText = `O cliente deve R$ ${totalAdiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, referente a adiantamentos`;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip 
            title={tooltipText}
            arrow
            placement="top"
          >
            <IconButton 
              size="small" 
              className="alert-icon"
              sx={{ 
                color: 'warning.main',
                '&:hover': {
                  backgroundColor: 'warning.light',
                  color: 'warning.contrastText'
                }
              }}
            >
              <Warning />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return null;
  }

  function handleOpenModal() {
    // Função removida
  }

  function handleCloseModal() {
    // Função removida
  }

  function handleConfirmAdiantamento() {
    // Função removida
  }

  async function processarAdiantamentosNoBackend(valor) {
    // Função removida
  }

  function renderAdiantamentoModal() {
    return null;
  }

  return(
    <>
      <Container>
        {info ? Header(info) : ""}
        <div className="organize">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <h1>RELATÓRIO DE COMPRA</h1>
            {renderAdiantamentoAlert()}
          </Box>
        </div>
        <div className="line"></div>
        <div className="organize">
          <h3>
            Fornecedor: {purchases ? purchases.fornecedor : ''}
          </h3>
          <h3>
            Data da compra: {purchases ? (new Date(purchases.data)).toLocaleDateString('pt-br') : ''}
          </h3>
        </div>
        <div className="line"></div>
        <div className="organize">
          <h4>
            DISCRIMINAÇÃO DE PRODUTOS
          </h4>
        </div>
        <div className="line"></div>
        <div className="info">
          <h4>Enumeração</h4>
          <h4>Descrição do Produto</h4>
          <h4>Quantidade</h4>
          <h4>Preço Unitário</h4>
          <h4>Total</h4>
        </div>
        {
          purchases ? renderProducts() : ""
        }
        <div className="line"></div>
        <div className="organize">
          <h4>
            PAGAMENTOS LANÇADOS
          </h4>
        </div>
        <div className="line"></div>
        <div className="info sub">
          <h4>Forma</h4>
          <h4>Detalhes</h4>
          <h4>Valor pago</h4>
        </div>
        {
          purchases ? renderInfo() : ""
        }
        <div className="line"></div>
        <div className="footer">
          
          <h4>Valor total dos produtos: {purchases ? calculateTotal()[0] : ""}</h4>
          <div className="linefooter"></div>
          {calcularTotalAdiantamentosAteDataCompra() !== 0 && (
            <>
              <h4>Adiantamentos pendentes: {calcularTotalAdiantamentosAteDataCompra().toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h4>
              <div className="linefooter"></div>
            </>
          )}
          <h4>Quantia paga: {purchases ? calculateTotal()[1] : ""}</h4>
          <div className="linefooter"></div>
          <h4>Saldo final: {purchases ? calculateTotal()[2] : ""}</h4>
          <div className="linefooter"></div>
        </div>
      </Container>
      {renderAdiantamentoModal()}
    </>
  )
}