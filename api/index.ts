import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint básico para probar
app.post('/users/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({ 
    message: 'Login endpoint working', 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Catch-all para otras rutas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    method: req.method 
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API called:', req.method, req.url);
  return app(req as any, res as any);
}
