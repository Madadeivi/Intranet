import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERROR CRÍTICO: La variable de entorno JWT_SECRET no está definida en authMiddleware.');
  console.error('La aplicación no puede iniciarse de forma segura sin JWT_SECRET.');
  throw new Error('JWT_SECRET es requerido para el middleware de autenticación');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    // Otros campos que puedas tener en tu payload de JWT
  };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Si no hay token, enviar respuesta de no autorizado
  if (!token) {
    res.status(401).json({ success: false, message: 'No autorizado, no hay token' });
    return;
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string, iat: number, exp: number };
    
    // Aquí podrías verificar si el usuario aún existe en la BD si es necesario,
    // pero para este caso, confiar en el token es suficiente si no ha expirado.
    req.user = { id: decoded.id, email: decoded.email }; // Adjuntar usuario al request
    next();
  } catch (error) {
    console.error('Error de autenticación de token:', error);
    res.status(401).json({ success: false, message: 'No autorizado, token falló' });
    return;
  }
};

// Middleware opcional para verificar si el usuario tiene un rol específico (si lo implementas)
/*
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
};
*/
