import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(helmet());
const allowedOrigins = ['https://example.com', 'https://another-example.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
