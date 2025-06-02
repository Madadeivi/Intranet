import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquema para la validación del login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'El correo electrónico debe ser una cadena de texto.',
    'string.email': 'El correo electrónico debe tener un formato válido.',
    'string.empty': 'El correo electrónico no puede estar vacío.',
    'any.required': 'El correo electrónico es obligatorio.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'La contraseña debe ser una cadena de texto.',
    'string.min': 'La contraseña debe tener al menos {#limit} caracteres.',
    'string.empty': 'La contraseña no puede estar vacía.',
    'any.required': 'La contraseña es obligatoria.'
  })
});

// Define Joi Schemas for your request bodies, params, or queries
// Example for sending an email:
export const emailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().min(3).required(),
  text: Joi.string().optional(),
  html: Joi.string().optional(),
}).or('text', 'html'); // Requires at least one of text or html

// Example for Zoho module and recordId params:
export const zohoParamsSchema = Joi.object({
  moduleName: Joi.string().alphanum().min(2).required(),
  recordId: Joi.string().alphanum().min(5).optional(), // Optional for fetching all records
});

export const zohoRecordIdRequiredSchema = zohoParamsSchema.keys({
    recordId: Joi.string().alphanum().min(5).required(),
});

// Esquema para la creación de registros en Zoho
// Este es un ejemplo genérico. Deberías adaptarlo a los campos específicos de tus módulos.
export const zohoCreateRecordSchema = Joi.object().unknown(true); // Permite campos no definidos en el esquema. Cambia a false para validación estricta.

// Esquema para la actualización de registros en Zoho
// Similar al de creación, pero los campos suelen ser opcionales en una actualización.
export const zohoUpdateRecordSchema = Joi.object().unknown(true).min(1); // Permite campos no definidos y requiere al menos un campo para actualizar.

// Middleware function for validation
export const validateRequest = (
  schema: Joi.ObjectSchema | Joi.AlternativesSchema,
  property: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => { // Añadir :void
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, 
      allowUnknown: property !== 'body', // Ser más estricto con el body
      stripUnknown: property === 'body', 
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message).join(', ');
      res.status(400).json({ 
        error: {
          message: `Validation failed: ${errorMessages}`,
          status: 400,
          details: error.details 
        }
      });
      return; // Asegurar que la función retorna aquí en caso de error
    }
    
    if (property === 'body') {
        req.body = value; 
    }
    
    next();
  };
};

// Esquema para la solicitud de establecer/cambiar contraseña
export const setPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'El correo electrónico es obligatorio.',
    'string.email': 'Debe proporcionar un correo electrónico válido.',
    'any.required': 'El correo electrónico es obligatorio.'
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.empty': 'La nueva contraseña es obligatoria.',
    'string.min': 'La nueva contraseña debe tener al menos {#limit} caracteres.',
    'any.required': 'La nueva contraseña es obligatoria.'
  })
});
