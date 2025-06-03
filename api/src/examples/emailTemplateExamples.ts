/**
 * Ejemplos de uso de las plantillas de email en diferentes contextos
 * Este archivo muestra cómo implementar las plantillas en otros controladores
 */

import { 
  generateTicketConfirmationEmail, 
  generateGeneralEmail, 
  generatePasswordResetEmail, 
  generateWelcomeEmail,
  TicketConfirmationData,
  GeneralEmailData 
} from '../services/emailTemplateService.js';
import { sendEmail } from '../services/emailService.js';

/**
 * Ejemplo: Enviar email de bienvenida cuando se activa una cuenta
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
  const loginUrl = process.env.FRONTEND_URL || 'https://intranet.coacharte.mx/login';
  
  const welcomeHtml = generateWelcomeEmail(userName, loginUrl);
  
  await sendEmail({
    to: userEmail,
    subject: '🎉 ¡Bienvenido a Coacharte! Tu cuenta está lista',
    html: welcomeHtml,
  });
  
  console.log(`✅ Email de bienvenida enviado a ${userEmail}`);
}

/**
 * Ejemplo: Enviar email de restablecimiento de contraseña
 */
export async function sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://intranet.coacharte.mx'}/reset-password?token=${resetToken}`;
  
  const resetHtml = generatePasswordResetEmail(userName, resetUrl);
  
  await sendEmail({
    to: userEmail,
    subject: '🔐 Restablecimiento de contraseña - Coacharte',
    html: resetHtml,
  });
  
  console.log(`✅ Email de restablecimiento enviado a ${userEmail}`);
}

/**
 * Ejemplo: Enviar notificación general a empleados
 */
export async function sendGeneralNotification(
  userEmail: string, 
  userName: string, 
  subject: string, 
  message: string
): Promise<void> {
  const emailData: GeneralEmailData = {
    userName,
    userEmail,
    subject,
    message
  };
  
  const notificationHtml = generateGeneralEmail(emailData);
  
  await sendEmail({
    to: userEmail,
    subject: `📢 ${subject} - Coacharte`,
    html: notificationHtml,
  });
  
  console.log(`✅ Notificación general enviada a ${userEmail}`);
}

/**
 * Ejemplo: Enviar múltiples emails masivos (con rate limiting)
 */
export async function sendBulkNotifications(
  recipients: Array<{ email: string; name: string }>,
  subject: string,
  message: string
): Promise<void> {
  console.log(`📧 Enviando notificación masiva a ${recipients.length} destinatarios...`);
  
  // Procesar en lotes para evitar sobrecarga del servidor SMTP
  const batchSize = 10;
  const delay = 2000; // 2 segundos entre lotes
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (recipient) => {
        try {
          await sendGeneralNotification(recipient.email, recipient.name, subject, message);
        } catch (error) {
          console.error(`❌ Error enviando a ${recipient.email}:`, error);
        }
      })
    );
    
    // Esperar antes del siguiente lote
    if (i + batchSize < recipients.length) {
      console.log(`⏳ Esperando ${delay}ms antes del siguiente lote...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`✅ Notificación masiva completada`);
}

/**
 * Ejemplo: Enviar email de confirmación con datos personalizados
 */
export async function sendCustomTicketConfirmation(ticketData: TicketConfirmationData): Promise<void> {
  const confirmationHtml = generateTicketConfirmationEmail(ticketData);
  
  await sendEmail({
    to: ticketData.userEmail,
    subject: `✅ Ticket #${ticketData.ticketNumber} confirmado - Coacharte`,
    html: confirmationHtml,
  });
  
  console.log(`✅ Confirmación de ticket enviada a ${ticketData.userEmail}`);
}

/**
 * Ejemplo de uso en un controlador de usuarios
 */
export class UserNotificationController {
  /**
   * Notificar cambios importantes en la cuenta
   */
  static async notifyAccountUpdate(userEmail: string, userName: string, updateType: string): Promise<void> {
    let subject: string;
    let message: string;
    
    switch (updateType) {
      case 'profile_updated':
        subject = 'Perfil actualizado exitosamente';
        message = `
          <p>Tu perfil en la intranet de Coacharte ha sido actualizado exitosamente.</p>
          <p>Si no realizaste estos cambios, contacta inmediatamente al equipo de soporte.</p>
        `;
        break;
        
      case 'role_changed':
        subject = 'Cambio de rol en el sistema';
        message = `
          <p>Tu rol en el sistema ha sido actualizado. Los nuevos permisos estarán disponibles en tu próximo inicio de sesión.</p>
          <p>Si tienes preguntas sobre tus nuevos permisos, contacta a tu supervisor o al equipo de TI.</p>
        `;
        break;
        
      case 'department_transfer':
        subject = 'Transferencia de departamento';
        message = `
          <p>Tu información de departamento ha sido actualizada en el sistema.</p>
          <p>Esto puede afectar tu acceso a ciertos recursos. Si experimentas problemas, contacta al equipo de soporte.</p>
        `;
        break;
        
      default:
        subject = 'Actualización de cuenta';
        message = '<p>Tu cuenta ha sido actualizada. Para más detalles, revisa tu perfil en la intranet.</p>';
    }
    
    await sendGeneralNotification(userEmail, userName, subject, message);
  }
  
  /**
   * Notificar vencimiento de contraseña
   */
  static async notifyPasswordExpiry(userEmail: string, userName: string, daysUntilExpiry: number): Promise<void> {
    const subject = `Tu contraseña vence en ${daysUntilExpiry} días`;
    const message = `
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>⚠️ Importante:</strong> Tu contraseña vencerá en <strong>${daysUntilExpiry} días</strong>.
        </p>
      </div>
      <p>Para mantener tu cuenta segura, te recomendamos cambiar tu contraseña antes de que expire.</p>
      <p>Puedes actualizar tu contraseña en la sección de "Perfil" de la intranet.</p>
      <p><strong>Consejos para una contraseña segura:</strong></p>
      <ul>
        <li>Usa al menos 8 caracteres</li>
        <li>Incluye mayúsculas, minúsculas, números y símbolos</li>
        <li>No uses información personal</li>
        <li>No reutilices contraseñas anteriores</li>
      </ul>
    `;
    
    await sendGeneralNotification(userEmail, userName, subject, message);
  }
}
