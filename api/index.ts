const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login básico para testing
app.post('/users/login', (req: any, res: any) => {
  console.log('Login attempt:', req.body);
  res.json({ 
    message: 'Login endpoint working', 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Catch-all
app.use('*', (req: any, res: any) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    method: req.method 
  });
});

export default function handler(req: any, res: any) {
  console.log('API called:', req.method, req.url);
  
  try {
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
