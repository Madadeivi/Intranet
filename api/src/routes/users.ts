import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { validateRequest, loginSchema, setPasswordSchema } from '../middleware/validationMiddleware.js'; // Importar loginSchema y setPasswordSchema

const router = Router();
const userController = new UserController();

// POST /api/users/login
router.post('/login', validateRequest(loginSchema, 'body'), userController.login);

// POST /api/users/set-password
router.post('/set-password', validateRequest(setPasswordSchema, 'body'), userController.setPassword);

// POST /api/users/request-password-reset
router.post('/request-password-reset', userController.requestPasswordReset); // TODO: Add validation schema if needed

// GET /api/users
router.get('/', userController.getAll);

// GET /api/users/:id
router.get('/:id', userController.getById);

// POST /api/users
router.post('/', userController.create);

// PUT /api/users/:id
router.put('/:id', userController.update);

// DELETE /api/users/:id
router.delete('/:id', userController.delete);

export default router;