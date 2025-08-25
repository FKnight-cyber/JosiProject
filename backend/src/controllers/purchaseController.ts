import { Request, Response } from "express";
import purchaseServices from "../services/purchaseService";

export async function newPurchase(req:Request, res:Response) {
  const id = Number(req.params.id);

  await purchaseServices.insert(req.body, id);

  return res.status(201).send("Compra registrada!");
};

export async function getPurchases(req:Request, res:Response) {
  const id = Number(req.params.id);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const { initial, final, status } = req.query;

  if(initial && final) {
    const result = await purchaseServices.getPurchasesByDate(id, initial.toString(), final.toString(), page, limit, status?.toString());
    return res.status(200).send(result);
  }

  const result = await purchaseServices.getPurchases(id, page, limit, status?.toString());

  return res.status(200).send(result);
};

export async function getTransactions(req:Request, res:Response) {
  const id = Number(req.params.id);

  const { initial, final } = req.query;

  if(initial && final) {
    const purchases = await purchaseServices.getTransactions(id,initial.toString(),final.toString());
    return res.status(200).send(purchases);
  }

  return res.status(200).send([]);
};

export async function getStock(req:Request, res:Response) {
  const { initial, final } = req.query;

  if(initial && final) {
    const info = await purchaseServices.getStockInfo(initial.toString(),final.toString());
    return res.status(200).send(info);
  }

  return res.status(200).send([]);
};

export async function getPurchaseInfo(req:Request, res:Response) {
  const id = Number(req.params.id);

  const purchases = await purchaseServices.getPurchaseInfo(id);

  return res.status(200).send(purchases);
};

export async function addPayment(req:Request, res:Response) {
  const id = Number(req.params.id);

  await purchaseServices.payment(req.body, id);

  return res.status(200).send("OK");
}

export async function removePurchase(req:Request, res:Response) {
  const id = Number(req.params.id);

  await purchaseServices.remove(id);

  return res.status(200).send("OK");
}