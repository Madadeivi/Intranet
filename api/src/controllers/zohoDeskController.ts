import { Request, Response, NextFunction } from 'express';
import * as zohoDeskService from '../services/zohoDeskService';

/**
 * Controlador para crear un nuevo ticket en Zoho Desk.
 */
export async function createTicketHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Aquí deberías validar el req.body para asegurarte de que tiene los campos necesarios
    // Por ejemplo, usando un esquema de Joi o Zod, o validación manual.
    const { subject, departmentId, contact, contactId, description, priority, status } = req.body;

    // Esta validación podría necesitar ajustes si departmentId es obligatorio
    if (!subject || !departmentId || (!contact && !contactId) || !description) {
      res.status(400).json({ 
        message: 'Faltan campos obligatorios: subject, departmentId, (contact o contactId), description son requeridos.' 
      });
      return;
    }
    
    // Validar que contact tenga email y lastName si se proporciona
    if (contact && (!contact.email || !contact.lastName)) {
        res.status(400).json({
            message: 'Si se proporciona el objeto \'contact\', debe incluir \'email\' y \'lastName\'.'
        });
        return;
    }

    const ticketData = {
      subject,
      departmentId,
      contact,
      contactId,
      description,
      priority,
      status,
    };

    const result = await zohoDeskService.createZohoDeskTicket(ticketData);
    res.status(201).json({ message: 'Ticket creado exitosamente en Zoho Desk', data: result });
    return;
  } catch (error) {
    next(error); // Pasa el error al manejador de errores global
  }
}

// Podrías añadir más manejadores aquí para otras rutas relacionadas con Zoho Desk
