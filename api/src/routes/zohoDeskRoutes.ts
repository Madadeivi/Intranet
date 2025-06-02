import { Router } from 'express';
import * as zohoDeskController from '../controllers/zohoDeskController';

const router = Router();

/**
 * @swagger
 * /zoho/desk/tickets:
 *   post:
 *     summary: Crea un nuevo ticket en Zoho Desk.
 *     tags: [ZohoDesk]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - departmentId
 *               - description
 *               - contact
 *             properties:
 *               subject:
 *                 type: string
 *                 example: 'Problema con la facturación'
 *               departmentId:
 *                 type: string
 *                 example: 'ID_DEL_DEPARTAMENTO_AQUI' // REEMPLAZA ESTO
 *               contact:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: 'cliente@example.com'
 *                   lastName:
 *                     type: string
 *                     example: 'Pérez'
 *                   firstName:
 *                     type: string
 *                     example: 'Juan'
 *               contactId:
 *                 type: string
 *                 example: 'ID_DEL_CONTACTO_EXISTENTE_SI_APLICA'
 *               description:
 *                 type: string
 *                 example: 'El cliente informa un error en su última factura.'
 *               priority:
 *                 type: string
 *                 example: 'High'
 *               status:
 *                 type: string
 *                 example: 'Open'
 *     responses:
 *       201:
 *         description: Ticket creado exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  '/tickets',
  zohoDeskController.createTicketHandler
);

export default router;
