import { Request, Response } from "express";
import clienteServices from "../services/clienteServices";

export async function newClient(req:Request, res:Response) {
  try {
    console.log('Dados recebidos no controller:', req.body);

    await clienteServices.register(req.body);

    return res.status(201).send("Registrado!");
  } catch (error) {
    console.error('Erro no controller:', error);
    return res.status(500).json({ error: error.message });
  }
};

export async function getClients(req:Request, res:Response) {
  const name = req.query.name;

  if(name) {
    const client = await clienteServices.findByName(name.toString());

    return res.status(200).send(client);
  }

  const clients = await clienteServices.findAll();

  return res.status(200).send(clients);
};

export async function getClientById(req:Request, res:Response) {
  const id:number = Number(req.params.id);

  const client = await clienteServices.findById(id);

  return res.status(200).send(client);
};

export async function updateCliente(req:Request, res:Response) {
  await clienteServices.updateClientInfo(req.body);

  return res.status(200).send('Registro do cliente atualizado!');
}

export async function removeCliente(req:Request, res:Response) {
  const id:number = Number(req.params.id);

  await clienteServices.removeClienteById(id);

  return res.status(200).send("Cliente removido!");
}