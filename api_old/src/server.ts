// Cargar variables de entorno PRIMERO
require('./loadEnv'); // CommonJS syntax

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar tipos de Express
import { Request, Response, NextFunction } from 'express';

const app = express();

// Middlewares de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false // Ajuste común para Vercel
}));

app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Ser más específico en producción
  credentials: true
}));

app.use(morgan('combined')); // 'combined' es más detallado para producción
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  standardHeaders: true, // Devuelve información del rate limit en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Deshabilita las cabeceras `X-RateLimit-*`
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/', limiter); // Aplicar a todas las rutas bajo /api (ya que Vercel rutea /api a este handler)

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Login básico para testing
app.post('/users/login', (req: Request, res: Response) => {
  console.log('Login attempt:', req.body);
  res.status(200).json({ 
    message: 'Login endpoint working', 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores (debe ser el último middleware de app.use ANTES del 404)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => { // _next es necesario para que Express lo reconozca como error handler
  console.error('Error Timestamp:', new Date().toISOString());
  console.error('Error Path:', _req.path);
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler (debe ir al FINAL de toda la pila de middlewares y rutas)
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl, // Usar originalUrl para ver la ruta completa
    method: req.method 
  });
});

// Exportar usando CommonJS
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });
}