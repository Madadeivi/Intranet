import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../api/src/server.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API called:', req.method, req.url);
  return app(req as any, res as any);
}
