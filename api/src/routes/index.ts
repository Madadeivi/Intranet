import { Router } from 'express';
import userRoutes from './users';
import zohoDeskRoutes from './zohoDeskRoutes'; // <--- Añadir esta línea
import { handleSendEmail } from '../controllers/emailController.js';
import { 
  fetchZohoRecords, 
  fetchZohoRecordById, 
  createZohoRecord, 
  updateZohoRecord, 
  deleteZohoRecord 
} from '../controllers/zohoCRMController.js';
import { 
  validateRequest, 
  emailSchema, 
  zohoParamsSchema, 
  zohoRecordIdRequiredSchema, 
  zohoCreateRecordSchema, 
  zohoUpdateRecordSchema 
} from '../middleware/validationMiddleware.js';

const router = Router();

// Ruta de bienvenida
router.get('/', (_req, res) => {
  res.json({
    message: 'Bienvenido a la API de Intranet Coacharte',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      health: '/health',
      sendEmail: '/api/email/send',
      // Zoho CRM
      getZohoRecords: '/api/zoho/:moduleName',
      getZohoRecordById: '/api/zoho/:moduleName/:recordId',
      createZohoRecord: '/api/zoho/:moduleName',
      updateZohoRecord: '/api/zoho/:moduleName/:recordId',
      deleteZohoRecord: '/api/zoho/:moduleName/:recordId',
    }
  });
});

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas para Zoho Desk  // <--- Añadir estas líneas
router.use('/zoho/desk', zohoDeskRoutes); // <--- Añadir estas líneas

// Ruta para enviar correos
router.post('/email/send', validateRequest(emailSchema, 'body'), handleSendEmail);

// Rutas para Zoho CRM
// GET all records for a module
router.get(
  '/zoho/:moduleName', 
  validateRequest(zohoParamsSchema, 'params'), 
  fetchZohoRecords
);

// GET a specific record by ID
router.get(
  '/zoho/:moduleName/:recordId',
  validateRequest(zohoRecordIdRequiredSchema, 'params'),
  fetchZohoRecordById
);

// POST (create) a new record in a module
router.post(
  '/zoho/:moduleName',
  validateRequest(zohoParamsSchema, 'params'), // Valida moduleName en params
  validateRequest(zohoCreateRecordSchema, 'body'), // Valida el cuerpo de la solicitud
  createZohoRecord
);

// PUT (update) an existing record by ID
router.put(
  '/zoho/:moduleName/:recordId',
  validateRequest(zohoRecordIdRequiredSchema, 'params'), // Valida moduleName y recordId en params
  validateRequest(zohoUpdateRecordSchema, 'body'), // Valida el cuerpo de la solicitud
  updateZohoRecord
);

// DELETE a record by ID
router.delete(
  '/zoho/:moduleName/:recordId',
  validateRequest(zohoRecordIdRequiredSchema, 'params'),
  deleteZohoRecord
);

export default router;