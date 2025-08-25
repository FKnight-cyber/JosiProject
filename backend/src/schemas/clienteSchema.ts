import joi from 'joi';

const clienteSchema = joi.object({
  name: joi.string().required().messages({
    'string.empty': 'Nome é obrigatório',
    'any.required': 'Nome é obrigatório'
  }),
  telefone: joi.string().required().messages({
    'string.empty': 'Telefone é obrigatório',
    'any.required': 'Telefone é obrigatório'
  }),
  pix: joi.string().required().messages({
    'string.empty': 'PIX é obrigatório',
    'any.required': 'PIX é obrigatório'
  }),
  cpf: joi.string().allow('', null).optional(),
  cnpj: joi.string().allow('', null).optional(),
  rua: joi.string().required().messages({
    'string.empty': 'Rua é obrigatória',
    'any.required': 'Rua é obrigatória'
  }),
  bairro: joi.string().required().messages({
    'string.empty': 'Bairro é obrigatório',
    'any.required': 'Bairro é obrigatório'
  }),
  cep: joi.string().required().messages({
    'string.empty': 'CEP é obrigatório',
    'any.required': 'CEP é obrigatório'
  }),
  cidade: joi.string().required().messages({
    'string.empty': 'Cidade é obrigatória',
    'any.required': 'Cidade é obrigatória'
  }),
  estado: joi.string().required().messages({
    'string.empty': 'Estado é obrigatório',
    'any.required': 'Estado é obrigatório'
  })
});

export default clienteSchema;