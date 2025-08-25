-- CreateTable
CREATE TABLE "public"."adiantamentos" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "dataAdiantamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adiantamentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."adiantamentos" ADD CONSTRAINT "adiantamentos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
