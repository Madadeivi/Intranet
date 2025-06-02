import { Request, Response, NextFunction } from 'express';
import { verifyCollaboratorPassword, setCollaboratorPasswordByEmail } from '../services/zohoCRMService.js'; // Importar el nuevo servicio
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
        // Asume que 'Password_Personalizada_Establecida' es el nombre API correcto
        // y que verifyCollaboratorPassword lo devuelve.
        // El valor por defecto si el campo no existe en el registro o no se seleccionó sería undefined.
        const passwordIsCustomized = collaborator.Password_Personalizada_Establecida === true;

        const payload = {
          id: collaborator.id, 
          email: collaborator.Email,
        };

        // Si la contraseña no ha sido personalizada, se requiere cambio.
        if (!passwordIsCustomized) {
          const tempOptions: SignOptions = {
            algorithm: 'HS256',
            expiresIn: '15m', // Token temporal corto para el cambio
          };
          const tempToken = jwt.sign({...payload, action: 'PENDING_PASSWORD_CHANGE'}, JWT_SECRET, tempOptions);
          
          res.status(200).json({
            success: true,
            requiresPasswordChange: true,
            message: 'Inicio de sesión exitoso. Se requiere cambio de contraseña.',
            tempToken: tempToken, 
            user: { 
              id: collaborator.id,
              email: collaborator.Email,
            }
          });
          return;
        }

        // Si la contraseña ya es personalizada, proceder con el login normal.
        const options: SignOptions = {
          algorithm: 'HS256',
          expiresIn: expiresInValue as any, 
        };
        const token = jwt.sign(payload, JWT_SECRET, options);

        res.json({
          success: true,
          requiresPasswordChange: false,
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
      // Asegurarse de que `next` se llame con un objeto Error
      const err = error instanceof Error ? error : new Error('Ocurrió un error durante el inicio de sesión.');
      next(err); 
    }
  }

  // POST /api/users/set-password
  async setPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'El correo electrónico y la nueva contraseña son obligatorios.'
        });
        return;
      }

      // Aquí podrías añadir validación para la fortaleza de la contraseña si lo deseas
      if (newPassword.length < 8) { // Ejemplo de validación simple
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres.'
        });
        return;
      }

      const success = await setCollaboratorPasswordByEmail(email, newPassword);

      if (success) {
        res.json({
          success: true,
          message: 'Contraseña actualizada exitosamente.'
        });
      } else {
        // El servicio ya loguea errores específicos, aquí damos una respuesta genérica
        res.status(500).json({
          success: false,
          message: 'No se pudo actualizar la contraseña. Verifica el correo electrónico o inténtalo más tarde.'
        });
      }
    } catch (error) {
      console.error('Error en setPassword controller:', error);
      // Asegurarse de que `next` se llame con un objeto Error
      const err = error instanceof Error ? error : new Error('Ocurrió un error al establecer la contraseña.');
      next(err);
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