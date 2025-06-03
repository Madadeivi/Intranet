import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API called:', req.method, req.url);
  
  try {
    const { default: app } = await import('./src/server.js');
    return app(req as any, res as any);
  } catch (error) {
    console.error('Error importing server:', error);
    res.status(500).json({ error: 'Server import failed' });
  }
}
