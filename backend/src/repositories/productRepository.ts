import { Produto } from "@prisma/client";
import prisma from "../database";
import { ProductCreationDTO } from "../dtos/productDtos";

async function insert(data:ProductCreationDTO) {
  await prisma.produto.create({data});
};

async function getProducts() {
  return await prisma.produto.findMany({
    where: { active: true },
    orderBy: { nome: "asc" },
  });
};

async function getByName(name: string) {
  return await prisma.produto.findFirst({
    where: { nome: name, active: true },
  });
};

async function filterByName(name: string) {
  return await prisma.produto.findMany({
    where: {
      active: true,
      nome: {
        startsWith: name,
        mode: "insensitive",
      },
    },
  });
};

async function getById(id: number) {
  return await prisma.produto.findFirst({where:{id}});
};

async function deleteProduct(id: number) {
  await prisma.produto.update({
    where: { id },
    data: { active: false },
  });
}

async function updateProduct(data: Produto) {
  const id = Number(data.id);
  await prisma.produto.update({
    where: { id },
    data: {
      nome: data.nome,
      medida: data.medida,
    },
  });
}

const productRepository = {
  insert,
  getProducts,
  getByName,
  filterByName,
  getById,
  deleteProduct,
  updateProduct
};

export default productRepository;