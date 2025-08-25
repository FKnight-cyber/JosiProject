import { Purchase } from "@prisma/client";
import prisma from "../database";
import { PurchaseCreationDTO, PurchaseData } from "../dtos/purchaseDtos";

async function insert(data:PurchaseCreationDTO) {
  return await prisma.purchase.create({data});
};

async function updatePurchase(id: number, data: Partial<Purchase>) {
  return await prisma.purchase.update({
    where: { id },
    data
  });
};

async function registerBoughtProduct(data:PurchaseData) {
  await prisma.purchaseProduct.create({data})
}

async function getPurchaseByClientId(clientId:number) {
  return await prisma.purchase.findFirst({where:{clientId},orderBy:{id:'desc'}})
};

async function getPurchasesByClientId(clientId:number) {
  return await prisma.purchase.findMany({where:{clientId},orderBy:{id:'desc'}})
};

async function getPurchasesByClientIdPaginated(clientId:number, limit:number, offset:number) {
  return await prisma.purchase.findMany({
    where: { clientId },
    orderBy:{id:'desc'},
    take: limit,
    skip: offset
  })
};

async function getTotalPurchasesByClientId(clientId:number) {
  const result = await prisma.purchase.count({where: { clientId }});
  return result;
};

async function getPurchaseById(id:number) {
  return await prisma.purchase.findFirst({where:{id}});
}

async function getClientPurchases(purchaseId:number) {
  return await prisma.purchaseProduct.findMany({
    where:{
      purchaseId
    },
    select:{
      id:true,
      price:true,
      quantity:true,
      produto:{}
    }
  })
}

async function addPayment(data:Purchase) {
  await prisma.purchase.update({where:{id:data.id},data});
};

async function getClientPurchasesByDate(clientId: number, initial:Date, final:Date) {
 return await prisma.purchase.findMany({where:{clientId,createdAt:{
  lte: final,
  gte: initial
 }}})
}

async function getClientPurchasesByDatePaginated(clientId: number, initial:Date, final:Date, limit:number, offset:number) {
  return await prisma.purchase.findMany({
    where: {
      clientId,
      createdAt: {
        gte: initial,
        lte: final
      }
    },
    orderBy:{id:'desc'},
    take: limit,
    skip: offset
  });
};

async function getTotalPurchasesByClientIdAndDate(clientId: number, initial:Date, final:Date) {
  const result = await prisma.purchase.count({
    where: {
      clientId,
      createdAt: {
        gte: initial,
        lte: final
      }
    }
  });
  return result;
};

async function getAllPurchasesByClientId(clientId:number) {
  return await prisma.purchase.findMany({where:{clientId}});
}

async function removePurchase(id:number) {
  await prisma.purchaseProduct.deleteMany({where:{purchaseId:id}});
  await prisma.purchase.delete({where:{id}});
}

const purchaseRepository = {
  insert,
  getClientPurchases,
  getClientPurchasesByDate,
  getClientPurchasesByDatePaginated,
  getTotalPurchasesByClientIdAndDate,
  getPurchaseByClientId,
  getPurchasesByClientId,
  getPurchasesByClientIdPaginated,
  getTotalPurchasesByClientId,
  getPurchaseById,
  registerBoughtProduct,
  addPayment,
  getAllPurchasesByClientId,
  removePurchase,
  updatePurchase
};

export default purchaseRepository;