import { Adiantamento } from '@prisma/client';

export type AdiantamentoCreationDTO = Omit<Adiantamento, "id" | "dataAdiantamento">;

export type AdiantamentoResponseDTO = Adiantamento & {
  cliente: {
    id: number;
    name: string;
  };
}; 