import { Request, Response, NextFunction } from 'express';
import { verifyCollaboratorPassword } from '../services/zohoCRMService.js'; // Importar el servicio
import jwt, { SignOptions } from 'jsonwebtoken'; // Para generar tokens JWT, importar SignOptions

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro_por_defecto'; 
const JWT_EXPIRES_IN_ENV = process.env.JWT_EXPIRES_IN; // Puede ser string o undefined

// Determinar expiresIn: si JWT_EXPIRES_IN_ENV es un número en string, parsearlo. Sino, usarlo como string o el default '1h'
let expiresInValue: string | number = '1h'; // Default
if (JWT_EXPIRES_IN_ENV) {
  const expiresInNum = parseInt(JWT_EXPIRES_IN_ENV, 10);
  if (!isNaN(expiresInNum) && expiresInNum.toString() === JWT_EXPIRES_IN_ENV) {
    expiresInValue = expiresInNum; // Es un número (segundos)
  } else {
    expiresInValue = JWT_EXPIRES_IN_ENV; // Es un string como '1d', '2h'
  }
}

if (JWT_SECRET === 'tu_secreto_jwt_super_seguro_por_defecto') {
  console.warn('ADVERTENCIA: JWT_SECRET no está configurado en las variables de entorno. Usando valor por defecto inseguro.');
}

export class UserController {
  // POST /api/users/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'El correo electrónico y la contraseña son obligatorios.'
        });
        return;
      }

      const collaborator = await verifyCollaboratorPassword(email, password);

      if (collaborator) {
        const payload = {
          id: collaborator.id, 
          email: collaborator.Email, 
        };

        const options: SignOptions = {
          algorithm: 'HS256', // Especificar algoritmo explícitamente
          expiresIn: expiresInValue as any, // Usar el valor procesado
        };

        const token = jwt.sign(payload, JWT_SECRET, options);

        res.json({
          success: true,
          message: 'Inicio de sesión exitoso.',
          token: token,
          user: { 
            id: collaborator.id,
            email: collaborator.Email,
          }
        });
        return;
      } else {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'
        });
        return;
      }
    } catch (error) {
      console.error('Error en el login:', error);
      next(new Error('Ocurrió un error durante el inicio de sesión.'));
      return;
    }
  }

  // GET /api/users
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> { 
    try {
      const users = [
        { id: 1, name: 'Usuario Demo', email: 'demo@coacharte.com' }
      ];
      
      res.json({
        success: true,
        data: users,
        count: users.length
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // GET /api/users/:id
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> { // Añadir Promise<void> y returns
    try {
      const { id } = req.params;
      const user = { id: Number(id), name: 'Usuario Demo', email: 'demo@coacharte.com' };
      
      res.json({
        success: true,
        data: user
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // POST /api/users
  async create(req: Request, res: Response, next: NextFunction): Promise<void> { // Añadir Promise<void> y returns
    try {
      const { name, email } = req.body;
      const newUser = { id: Date.now(), name, email };
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuario creado exitosamente'
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // PUT /api/users/:id
  async update(req: Request, res: Response, next: NextFunction): Promise<void> { // Añadir Promise<void> y returns
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      const updatedUser = { id: Number(id), name, email };
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuario actualizado exitosamente'
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // DELETE /api/users/:id
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> { // Añadir Promise<void> y returns
    try {
      const { id } = req.params;
      res.json({
        success: true,
        message: `Usuario ${id} eliminado exitosamente`
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}