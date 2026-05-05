import { Produto } from '@prisma/client';

/** Criação: `active` vem do default do banco (true) */
export type ProductCreationDTO = Omit<Produto, 'id' | 'active'>;