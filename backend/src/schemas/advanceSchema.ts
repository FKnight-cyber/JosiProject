import joi from 'joi';

const advanceSchema = joi.object({
  clientId: joi.number().required().messages({
    'number.base': 'Client ID must be a number',
    'any.required': 'Client ID is required'
  }),
  valor: joi.number().positive().required().messages({
    'number.base': 'Value must be a number',
    'number.positive': 'Value must be positive',
    'any.required': 'Value is required'
  }),
  descricao: joi.string().allow('', null).optional()
});

export default advanceSchema;
