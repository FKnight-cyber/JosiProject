import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Empresa, PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const data = {
  id:1,
  name: "ANTÔNIO GOUVÊA",
  description: "RECICLAGEM ALIANÇA, UM COMPROMISSO COM VOCÊ",
  telefone: "85988883524",
  cnpj: "49.940.808/0001-48",
  rua: "RUA COSME E JERÔNIMO, Nº 813 GALPÃO",
  bairro: "MONDUBIM",
  cep: "60765378",
  cidade: "FORTALEZA",
  estado: "CE"
}

async function main() {
  await insertEmpresa(data);
};

async function insertEmpresa(empresa:Empresa) {
    await prisma.empresa.upsert({
      where:{
        id: empresa.id
      },
      update: {
        name: empresa.name,
        description: empresa.description,
        telefone: empresa.telefone,
        cnpj: empresa.cnpj,
        rua: empresa.rua,
        bairro: empresa.bairro,
        cep: empresa.cep,
        cidade: empresa.cidade,
        estado: empresa.estado
      },
      create: {
        name: empresa.name,
        description: empresa.description,
        telefone: empresa.telefone,
        cnpj: empresa.cnpj,
        rua: empresa.rua,
        bairro: empresa.bairro,
        cep: empresa.cep,
        cidade: empresa.cidade,
        estado: empresa.estado
      }
    });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });