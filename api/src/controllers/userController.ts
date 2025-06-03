import { Request, Response, NextFunction } from 'express';
import { verifyCollaboratorPassword, setCollaboratorPasswordByEmail, getCollaboratorDetailsByEmail, storePasswordResetToken } from '../services/zohoCRMService.js'; // Importar el nuevo servicio
import { sendEmail } from '../services/emailService.js'; // Importar sendEmail desde emailService
import jwt, { SignOptions } from 'jsonwebtoken'; // Para generar tokens JWT, importar SignOptions

const JWT_SECRET_FROM_ENV = process.env.JWT_SECRET;
const CLIENT_URL_FROM_ENV = process.env.CLIENT_URL_FROM_ENV;

if (!JWT_SECRET_FROM_ENV) {
  console.error('ERROR CRÍTICO: La variable de entorno JWT_SECRET no está definida.');
  console.error('La aplicación no puede iniciarse de forma segura sin JWT_SECRET.');
  console.error('Por favor, defina la variable de entorno JWT_SECRET y reinicie la aplicación.');
  process.exit(1); // Salir del proceso si JWT_SECRET no está definido
}

if (!CLIENT_URL_FROM_ENV) {
  console.error('ERROR CRÍTICO: La variable de entorno CLIENT_URL_FROM_ENV no está definida.');
  console.error('Esta variable es necesaria para generar URLs de redirección para reset de contraseña.');
  console.error('Por favor, defina la variable de entorno CLIENT_URL_FROM_ENV y reinicie la aplicación.');
  process.exit(1); // Salir del proceso si CLIENT_URL_FROM_ENV no está definido
}

// Validar que JWT_SECRET tenga una longitud mínima segura
if (JWT_SECRET_FROM_ENV.length < 32) {
  console.error('ERROR CRÍTICO: JWT_SECRET debe tener al menos 32 caracteres para ser seguro.');
  console.error('Por favor, defina un JWT_SECRET más largo y complejo en las variables de entorno.');
  process.exit(1);
}

// Validar que JWT_SECRET no contenga valores comunes inseguros
const INSECURE_PATTERNS = [
  'secret',
  'password',
  'default',
  'jwt',
  'token',
  '123456',
  'qwerty',
  'admin'
];

const jwtSecretLower = JWT_SECRET_FROM_ENV.toLowerCase();
const hasInsecurePattern = INSECURE_PATTERNS.some(pattern => jwtSecretLower.includes(pattern));

if (hasInsecurePattern) {
  console.error('ERROR CRÍTICO: JWT_SECRET contiene patrones inseguros comunes.');
  console.error('Por favor, use un JWT_SECRET único y complejo sin palabras comunes.');
  process.exit(1);
}

const JWT_SECRET: jwt.Secret = JWT_SECRET_FROM_ENV;
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

export class UserController {
  // POST /api/users/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      let collaborator;
      try {
        collaborator = await verifyCollaboratorPassword(email, password);
      } catch (err) {
        if (err instanceof Error && err.message === 'INACTIVE_ACCOUNT') {
          res.status(403).json({
            success: false,
            code: 'INACTIVE_ACCOUNT',
            message: 'Cuenta inactiva. Por favor contacte al administrador.'
          });
          return;
        }
        throw err;
      }

      if (collaborator) {
        // Asume que 'Contrasena_Personalizada_Establecida' es el nombre API correcto
        // y que verifyCollaboratorPassword lo devuelve.
        // El valor por defecto si el campo no existe en el registro o no se seleccionó sería undefined.
        const passwordIsCustomized = collaborator.Contrasena_Personalizada_Establecida === true;

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

  // POST /api/users/request-password-reset
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as RequestPasswordResetPayload;

      if (!email) {
        res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio.' });
        return;
      }

      const collaborator = await getCollaboratorDetailsByEmail(email);
      if (!collaborator || !collaborator.id) {
        // No revelar si el email existe o no por seguridad, pero sí loguearlo.
        console.warn(`Solicitud de restablecimiento para email no encontrado o sin ID: ${email}`);
        // Devolver una respuesta genérica para evitar la enumeración de usuarios
        res.status(200).json({ 
          success: true, 
          message: 'Si tu correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.' 
        });
        return;
      }

      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiryDate = new Date(Date.now() + 3600000); // 1 hora de expiración

      const stored = await storePasswordResetToken(collaborator.id, resetToken, expiryDate);

      if (!stored) {
        res.status(500).json({ success: false, message: 'No se pudo procesar la solicitud de restablecimiento de contraseña.' });
        return;
      }

      const resetUrl = `${CLIENT_URL_FROM_ENV}/reset-password?token=${resetToken}`;
      // Enviar correo electrónico
      try {
        await sendEmail({
          to: email,
          subject: 'Restablecimiento de Contraseña - Coacharte Intranet',
          html: `
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña para la Intranet de Coacharte.</p>
            <p>Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Saludos,<br>El equipo de Coacharte</p>
          `,
        });
        res.status(200).json({ 
          success: true, 
          message: 'Si tu correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.' 
        });
      } catch (emailError) {
        console.error('Error enviando email de restablecimiento:', emailError);
        // Aunque el email falle, el token se guardó. Podría ser un problema del servicio de correo.
        // Considerar si se debe invalidar el token aquí o manejarlo de otra forma.
        res.status(500).json({ success: false, message: 'Error al enviar el correo de restablecimiento.' });
      }

    } catch (error) {
      console.error('Error en requestPasswordReset controller:', error);
      const err = error instanceof Error ? error : new Error('Ocurrió un error al solicitar el restablecimiento de contraseña.');
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

// Interfaz para el payload de solicitud de restablecimiento de contraseña
interface RequestPasswordResetPayload {
  email: string;
}