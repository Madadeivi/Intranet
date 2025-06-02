import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { validateRequest, loginSchema, setPasswordSchema } from '../middleware/validationMiddleware.js';
import { authRateLimit, passwordResetRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = Router();
const userController = new UserController();

// POST /api/users/login - PROTEGIDO CON RATE LIMITING
router.post('/login', authRateLimit, validateRequest(loginSchema, 'body'), userController.login);

// POST /api/users/set-password - PROTEGIDO CON RATE LIMITING
router.post('/set-password', authRateLimit, validateRequest(setPasswordSchema, 'body'), userController.setPassword);

// POST /api/users/request-password-reset - PROTEGIDO CON RATE LIMITING
router.post('/request-password-reset', passwordResetRateLimit, userController.requestPasswordReset);

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