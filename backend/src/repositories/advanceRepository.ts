import { Adiantamento } from '@prisma/client';
import prisma from '../database';
import { AdiantamentoCreationDTO } from '../dtos/adiantamentoDtos';
import { checkError } from '../middlewares/errorHandler';

async function insert(data: AdiantamentoCreationDTO) {
  try {
    const result = await prisma.adiantamento.create({data});
    return result;
  } catch (error) {
    console.error('Error in advance repository:', error);
    throw error;
  }
}

async function findByClientId(clientId: number) {
  return await prisma.adiantamento.findMany({
    where: { clientId },
    include: {
      cliente: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { dataAdiantamento: 'desc' }
  });
}

async function findByClientIdWithPagination(clientId: number, page: number = 1, limit: number = 5) {
  try {
    const offset = (page - 1) * limit;
    
    const adiantamentos = await prisma.adiantamento.findMany({
      where: { clientId },
      include: {
        cliente: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { dataAdiantamento: 'desc' },
      take: limit,
      skip: offset
    });
    
    // Contar total de adiantamentos
    const total = await prisma.adiantamento.count({
      where: { clientId }
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      adiantamentos,
      total,
      totalPages,
      currentPage: page,
      limit
    };
  } catch (error) {
    throw checkError(400, "Error finding advances with pagination");
  }
}

// Nova função para buscar adiantamentos até uma data específica
async function findByClientIdUntilDate(clientId: number, date: string) {
  try {
    const result = await prisma.adiantamento.findMany({
      where: {
        clientId: clientId,
        dataAdiantamento: {
          lte: new Date(date)
        }
      },
      include: {
        cliente: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        dataAdiantamento: 'asc'
      }
    });
    return result;
  } catch (error) {
    throw checkError(400, "Error finding advances until date");
  }
}

async function findById(id: number) {
  return await prisma.adiantamento.findFirst({
    where: { id },
    include: {
      cliente: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

async function removeById(id: number) {
  const result = await prisma.adiantamento.delete({where:{id}});
  return result;
}

const advanceRepository = {
  insert,
  findByClientId,
  findByClientIdWithPagination,
  findByClientIdUntilDate,
  findById,
  removeById
};

export default advanceRepository;
