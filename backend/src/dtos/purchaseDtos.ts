import { Purchase } from "@prisma/client";

export type PurchaseCreationDTO = Omit<Purchase, "id" | "createdAt" | "forma" | "detalhe" | "valor" | "wasPaid">;

export type PurchaseRequest = {
  name: string,
  price: number,
  quantity: number,
}

export type PaymentRequest = {
  forma:string,
  detalhe: string,
  valor: number
}

export type PurchaseData = {
  productId: number,
  purchaseId: number,
  price: number,
  quantity: number
}

export type PurchaseWithStatus = Purchase & {
  status: string;
}