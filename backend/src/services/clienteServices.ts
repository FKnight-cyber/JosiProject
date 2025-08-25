import { Cliente } from "@prisma/client";
import { ClienteCreationDTO } from "../dtos/clienteDtos";
import { checkError } from "../middlewares/errorHandler";
import clienteRepository from "../repositories/clienteRepository";

async function register(data:ClienteCreationDTO) {
  try {
    await clienteRepository.insert(data);
  } catch (error) {
    console.error('Erro no service:', error);
    throw checkError(409,"registration failed");
  }
};

async function findAll() {
  return await clienteRepository.getClients();
};

async function findByName(name:string) {
  return await clienteRepository.clientByName(name);
};

async function findById(id:number) {
  return await clienteRepository.clientById(id);
};

async function updateClientInfo(data:Cliente) {
  await clienteRepository.updateClienteInfo(data);
};

async function removeClienteById(id:number) {
  await clienteRepository.removeCliente(id);
};

const clienteServices = {
  register,
  findAll,
  findByName,
  updateClientInfo,
  removeClienteById,
  findById
};

export default clienteServices;