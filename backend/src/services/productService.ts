import { ProductCreationDTO } from "../dtos/productDtos";
import productRepository from "../repositories/productRepository";

async function insert(data: ProductCreationDTO) {
  await productRepository.insert(data);
};

async function getProduct(name:string) {
  return await productRepository.getByName(name);
};

async function getProducts() {
  return await productRepository.getProducts();
};

async function remove(id: number) {
  await productRepository.deleteProduct(id);
}

const productServices = {
  insert,
  getProduct,
  getProducts,
  remove
};

export default productServices;