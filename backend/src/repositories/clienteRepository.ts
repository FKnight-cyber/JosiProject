import { Cliente } from '@prisma/client';
import prisma from '../database';
import { ClienteCreationDTO } from '../dtos/clienteDtos';
import purchaseRepository from './purchaseRepository';

async function insert(data:ClienteCreationDTO) {
  await prisma.cliente.create({data});
};

async function getClients() {
  return await prisma.cliente.findMany({orderBy:[{id:'desc'}]});
};

async function clientByName(nome:string) {
  return await prisma.cliente.findMany({
    where: {
      name: {
        startsWith: nome,
        mode: "insensitive"
      }
    }
  });
};

async function clientById(id:number) {
  return await prisma.cliente.findFirst({where:{id}})
};

async function updateClienteInfo(data:Cliente) {
  data.id = Number(data.id);
  await prisma.cliente.update({
    where:{
      id:data.id
    },
    data
  });
}

async function removeCliente(id:number) {
  const purchases = await purchaseRepository.getAllPurchasesByClientId(id);

  for(const purchase of purchases) {
    await purchaseRepository.removePurchase(purchase.id);
  }

  await prisma.cliente.delete({where:{id}});
}

const clienteRepository = {
  insert,
  getClients,
  clientByName,
  updateClienteInfo,
  removeCliente,
  clientById
};

export default clienteRepository;
