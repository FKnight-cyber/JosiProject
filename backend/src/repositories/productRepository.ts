import { Produto } from "@prisma/client";
import prisma from "../database";
import { ProductCreationDTO } from "../dtos/productDtos";

async function insert(data:ProductCreationDTO) {
  await prisma.produto.create({data});
};

async function getProducts() {
  return await prisma.produto.findMany({orderBy:{nome:"asc"}});
};

async function getByName(name: string) {
  return await prisma.produto.findFirst({where:{nome:name}});
};

async function filterByName(name: string) {
  return await prisma.produto.findMany({
    where: {
      nome: {
        startsWith: name,
        mode: "insensitive"
      }
    }
  });
};

async function getById(id: number) {
  return await prisma.produto.findFirst({where:{id}});
};

async function deleteProduct(id: number) {
  await prisma.produto.delete({where:{id}});
}

async function updateProduct(data:Produto) {
  data.id = Number(data.id);
  await prisma.produto.update({
    where:{
      id:data.id
    },
    data
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