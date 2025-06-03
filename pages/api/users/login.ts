import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      
      res.status(200).json({ 
        message: 'Login endpoint working', 
        receivedData: { email, password: password ? '***' : undefined },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid request body' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}