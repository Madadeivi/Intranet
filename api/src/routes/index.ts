import { Router } from 'express';
import userRoutes from './users';

const router = Router();

// Ruta de bienvenida
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Intranet Coacharte',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      health: '/health'
    }
  });
});

// Rutas de usuarios
router.use('/users', userRoutes);

export default router;