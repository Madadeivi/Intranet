import { VercelRequest, VercelResponse } from '@vercel/node';
import app from './src/server.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API Function called:', req.method, req.url);
  
  // Llamar directamente a la app Express
  return app(req as any, res as any);
}