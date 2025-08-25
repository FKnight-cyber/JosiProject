import advanceRepository from "../repositories/advanceRepository";
import { checkError } from "../middlewares/errorHandler";
import prisma from "../database";

async function register(data) {
  try {
    const result = await advanceRepository.insert(data);
    return result;
  } catch (error) {
    console.error('Error in advance service:', error);
    throw checkError(400, "Error creating advance");
  }
}

async function findByClientId(clientId) {
  try {
    const result = await advanceRepository.findByClientId(clientId);
    return result;
  } catch (error) {
    throw checkError(400, "Error finding advances");
  }
}

async function findByClientIdWithPagination(clientId, page = 1, limit = 5) {
  try {
    const result = await advanceRepository.findByClientIdWithPagination(clientId, page, limit);
    return result;
  } catch (error) {
    throw checkError(400, "Error finding advances with pagination");
  }
}

async function findById(id) {
  try {
    const result = await advanceRepository.findById(id);
    if (!result) {
      throw checkError(404, "Advance not found");
    }
    return result;
  } catch (error) {
    throw checkError(400, "Error finding advance");
  }
}

async function removeById(id) {
  try {
    const result = await advanceRepository.removeById(id);
    return result;
  } catch (error) {
    throw checkError(400, "Error removing advance");
  }
}

// Nova função para buscar adiantamentos até uma data específica
async function findByClientIdUntilDate(clientId, date) {
  try {
    const result = await advanceRepository.findByClientIdUntilDate(clientId, date);
    return result;
  } catch (error) {
    throw checkError(400, "Error finding advances until date");
  }
}

// Nova função para calcular adiantamentos pendentes
async function calculatePendingAdvances(clientId) {
  try {
    const advances = await advanceRepository.findByClientId(clientId);
    if (!advances || advances.length === 0) {
      return 0;
    }
    
    // Calcular o total de adiantamentos (valores positivos - valores negativos)
    const total = advances.reduce((sum, advance) => sum + advance.valor, 0);
    return total; // Retorna o valor real, mesmo que seja negativo
  } catch (error) {
    console.error('Error calculating pending advances:', error);
    return 0;
  }
}

// Nova função para aplicar adiantamentos automaticamente a uma compra
async function applyAdvancesToPurchase(clientId, purchaseId, productValue) {
  try {
    const pendingAdvances = await calculatePendingAdvances(clientId);
    
    if (pendingAdvances <= 0) {
      return {
        valorAdiantamentos: 0,
        valorRestante: productValue,
        status: productValue > 0 ? "PENDENTE" : "CONCLUIDO"
      };
    }
    
    // Aplicar adiantamentos à compra
    const valorAdiantamentosAplicado = Math.min(pendingAdvances, productValue);
    const valorRestante = productValue - valorAdiantamentosAplicado;
    
    // Determinar o status baseado no valor restante
    const status = valorRestante <= 0 ? "CONCLUIDO" : "PENDENTE";
    
    // Registrar os débitos de adiantamentos
    if (valorAdiantamentosAplicado > 0) {
      const advances = await advanceRepository.findByClientId(clientId);
      let valorRestanteParaDebitar = valorAdiantamentosAplicado;
      
      for (const advance of advances) {
        if (valorRestanteParaDebitar <= 0) break;
        if (advance.valor <= 0) continue; // Pular débitos
        
        const valorParaDebitar = Math.min(advance.valor, valorRestanteParaDebitar);
        const novoDebito = {
          clientId: clientId,
          valor: -valorParaDebitar,
          descricao: `Débito automático na compra ${purchaseId} - ${advance.descricao || 'Adiantamento anterior'}`
        };
        
        await advanceRepository.insert(novoDebito);
        valorRestanteParaDebitar -= valorParaDebitar;
      }
    }
    
    return {
      valorAdiantamentos: valorAdiantamentosAplicado,
      valorRestante: valorRestante,
      status: status
    };
  } catch (error) {
    console.error('Error applying advances to purchase:', error);
    throw checkError(400, "Error applying advances to purchase");
  }
}

async function processAdvancePurchase(clientId, purchaseId, valorUsado) {
  try {
    const advances = await advanceRepository.findByClientId(clientId);
    if (!advances || advances.length === 0) {
      throw new Error('Client has no advances');
    }
    let valorRestante = valorUsado;
    const advancesProcessed = [];
    for (const advance of advances) {
      if (valorRestante <= 0) break;
      const valorParaUsar = Math.min(advance.valor, valorRestante);
      const novoAdvance = {
        clientId: clientId,
        valor: -valorParaUsar,
        descricao: `Debit related to purchase ${purchaseId} - ${advance.descricao || 'Previous advance'}`
      };
      await advanceRepository.insert(novoAdvance);
      advancesProcessed.push({
        advanceId: advance.id,
        valorUsado: valorParaUsar,
        valorRestante: advance.valor - valorParaUsar
      });
      valorRestante -= valorParaUsar;
    }
    // Update valorAdiantamentos field in purchase
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { valorAdiantamentos: valorUsado }
    });
    return {
      message: 'Advances processed successfully',
      valorTotalUsado: valorUsado - valorRestante,
      advancesProcessed
    };
  } catch (error) {
    throw checkError(400, "Error processing advances");
  }
}

const advanceService = {
  register,
  findByClientId,
  findByClientIdWithPagination,
  findByClientIdUntilDate,
  findById,
  removeById,
  calculatePendingAdvances,
  applyAdvancesToPurchase,
  processAdvancePurchase
};

export default advanceService;
