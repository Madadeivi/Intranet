/**
 * Servicio para generar plantillas de email HTML profesionales
 * con el branding y diseño de Coacharte
 */

export interface TicketConfirmationData {
  userName: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  webUrl?: string;
  userEmail: string;
}

export interface GeneralEmailData {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
}

/**
 * Genera el HTML base común para todos los emails
 */
const getEmailBaseTemplate = (content: string): string => {
  return `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Coacharte - Notificación</title>
  
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  
  <style>
    /* Reseteo y estilos base */
    * { box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Fuentes personalizadas */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Variables CSS */
    :root {
      --primary-color: #1E88E5;
      --primary-dark: #1565C0;
      --primary-light: #42A5F5;
      --text-dark: #1A1A1A;
      --text-medium: #4A4A4A;
      --text-light: #6B7280;
      --background: #F8FAFC;
      --border: #E5E7EB;
      --success: #10B981;
      --warning: #F59E0B;
      --error: #EF4444;
    }
    
    /* Estilos principales */
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1A1A1A;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
    
    .header {
      background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
      padding: 30px 40px;
      text-align: center;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    
    .content {
      padding: 40px;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 20px 0;
    }
    
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4A4A4A;
      margin: 0 0 30px 0;
    }
    
    .ticket-info {
      background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
      border: 1px solid #BAE6FD;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .ticket-number {
      font-size: 18px;
      font-weight: 600;
      color: #1E88E5;
      margin: 0 0 12px 0;
    }
    
    .ticket-details {
      display: table;
      width: 100%;
    }
    
    .detail-row {
      display: table-row;
    }
    
    .detail-label {
      display: table-cell;
      padding: 6px 16px 6px 0;
      font-weight: 500;
      color: #6B7280;
      width: 120px;
      vertical-align: top;
    }
    
    .detail-value {
      display: table-cell;
      padding: 6px 0;
      color: #1A1A1A;
      vertical-align: top;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: all 0.2s ease;
      margin: 20px 0;
    }
    
    .button:hover {
      background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
      transform: translateY(-1px);
    }
    
    .footer {
      background-color: #F8FAFC;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6B7280;
      margin: 0 0 8px 0;
    }
    
    .footer-link {
      color: #1E88E5;
      text-decoration: none;
    }
    
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .priority-low { background-color: #DCFCE7; color: #166534; }
    .priority-medium { background-color: #FEF3C7; color: #92400E; }
    .priority-high { background-color: #FED7AA; color: #C2410C; }
    .priority-urgent { background-color: #FEE2E2; color: #DC2626; }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container { margin: 0; border-radius: 0; }
      .header, .content, .footer { padding: 20px; }
      .greeting { font-size: 18px; }
      .button { display: block; margin: 20px auto; }
    }
  </style>
</head>
<body>
  <div style="padding: 20px 0;">
    <div class="email-container">
      ${content}
    </div>
  </div>
</body>
</html>`;
};

/**
 * Genera la plantilla de confirmación de ticket de soporte
 */
export const generateTicketConfirmationEmail = (data: TicketConfirmationData): string => {
  const { userName, ticketNumber, subject, category, priority, message, webUrl } = data;
  
  // Mapear prioridad a clase CSS
  const priorityClass = `priority-${priority.toLowerCase()}`;
  
  // Mapear categoría a texto legible
  const categoryMap: Record<string, string> = {
    'technical': '🔧 Soporte Técnico',
    'general': '💬 Consulta General',
    'nomina': '💳 Nómina',
    'other': '📋 Otro'
  };
  
  const categoryLabel = categoryMap[category] || category;
  
  const content = `
    <div class="header">
      <div class="logo">Coacharte</div>
    </div>
    
    <div class="content">
      <h1 class="greeting">¡Hola ${userName}!</h1>
      
      <p class="message">
        Hemos recibido tu solicitud de soporte y la estamos procesando. 
        Nuestro equipo especializado revisará tu caso y te contactará lo antes posible.
      </p>
      
      <div class="ticket-info">
        <div class="ticket-number">📋 Ticket #${ticketNumber}</div>
        
        <div class="ticket-details">
          <div class="detail-row">
            <div class="detail-label">Asunto:</div>
            <div class="detail-value"><strong>${subject}</strong></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Categoría:</div>
            <div class="detail-value">${categoryLabel}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Prioridad:</div>
            <div class="detail-value">
              <span class="priority-badge ${priorityClass}">${priority}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Descripción:</div>
            <div class="detail-value">${message.length > 100 ? message.substring(0, 100) + '...' : message}</div>
          </div>
        </div>
      </div>
      
      ${webUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${webUrl}" class="button" target="_blank" rel="noopener noreferrer">
            🔍 Ver Estado del Ticket
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6B7280; text-align: center;">
          También puedes copiar y pegar este enlace en tu navegador:<br>
          <a href="${webUrl}" style="color: #1E88E5; word-break: break-all;">${webUrl}</a>
        </p>
      ` : ''}
      
      <div style="background: #F0F9FF; border-left: 4px solid #1E88E5; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; color: #1565C0;">
          <strong>💡 Consejo:</strong> Guarda este email para futura referencia. 
          Todas las actualizaciones de tu ticket se enviarán a tu correo electrónico.
        </p>
      </div>
      
      <p class="message">
        Si tienes alguna pregunta adicional o necesitas actualizar tu solicitud, 
        no dudes en responder a este correo mencionando el número de ticket.
      </p>
      
      <p style="margin: 30px 0 0 0; color: #4A4A4A;">
        Saludos cordiales,<br>
        <strong>Equipo de Soporte de Coacharte</strong><br>
        <span style="color: #6B7280; font-size: 14px;">Tu éxito es nuestro compromiso</span>
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Este correo fue enviado automáticamente. Por favor no respondas a esta dirección.
      </p>
      <p class="footer-text">
        <a href="mailto:soporte@coacharte.mx" class="footer-link">soporte@coacharte.mx</a> | 
        <a href="https://coacharte.mx" class="footer-link">www.coacharte.mx</a>
      </p>
      <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} Coacharte. Todos los derechos reservados.
      </p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
};

/**
 * Genera una plantilla de email general
 */
export const generateGeneralEmail = (data: GeneralEmailData): string => {
  const { userName, subject, message } = data;
  
  const content = `
    <div class="header">
      <div class="logo">Coacharte</div>
    </div>
    
    <div class="content">
      <h1 class="greeting">¡Hola ${userName}!</h1>
      
      <h2 style="color: #1E88E5; font-size: 18px; margin: 0 0 20px 0;">${subject}</h2>
      
      <div class="message">${message}</div>
      
      <p style="margin: 30px 0 0 0; color: #4A4A4A;">
        Saludos cordiales,<br>
        <strong>Equipo de Coacharte</strong><br>
        <span style="color: #6B7280; font-size: 14px;">Tu éxito es nuestro compromiso</span>
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        <a href="mailto:soporte@coacharte.mx" class="footer-link">soporte@coacharte.mx</a> | 
        <a href="https://coacharte.mx" class="footer-link">www.coacharte.mx</a>
      </p>
      <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} Coacharte. Todos los derechos reservados.
      </p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
};

/**
 * Genera plantilla para notificación de cambio de contraseña
 */
export const generatePasswordResetEmail = (userName: string, resetLink: string): string => {
  const content = `
    <div class="header">
      <div class="logo">Coacharte</div>
    </div>
    
    <div class="content">
      <h1 class="greeting">¡Hola ${userName}!</h1>
      
      <p class="message">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Coacharte.
        Si fuiste tú quien solicitó este cambio, haz clic en el botón de abajo para continuar.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button" target="_blank" rel="noopener noreferrer">
          🔐 Restablecer Contraseña
        </a>
      </div>
      
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad. 
          Si no solicitaste este cambio, puedes ignorar este correo.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #6B7280; text-align: center;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${resetLink}" style="color: #1E88E5; word-break: break-all;">${resetLink}</a>
      </p>
      
      <p style="margin: 30px 0 0 0; color: #4A4A4A;">
        Saludos cordiales,<br>
        <strong>Equipo de Seguridad de Coacharte</strong>
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        Este correo fue enviado automáticamente. Por favor no respondas a esta dirección.
      </p>
      <p class="footer-text">
        <a href="mailto:soporte@coacharte.mx" class="footer-link">soporte@coacharte.mx</a> | 
        <a href="https://coacharte.mx" class="footer-link">www.coacharte.mx</a>
      </p>
      <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} Coacharte. Todos los derechos reservados.
      </p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
};

/**
 * Genera plantilla para notificación de bienvenida
 */
export const generateWelcomeEmail = (userName: string, loginUrl: string): string => {
  const content = `
    <div class="header">
      <div class="logo">Coacharte</div>
    </div>
    
    <div class="content">
      <h1 class="greeting">¡Bienvenido ${userName}!</h1>
      
      <p class="message">
        Nos complace informarte que tu cuenta en la Intranet de Coacharte ha sido activada exitosamente. 
        Ahora tienes acceso a todas las herramientas y recursos que te ayudarán en tu desarrollo profesional.
      </p>
      
      <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1E88E5; margin: 0 0 16px 0;">🚀 ¿Qué puedes hacer ahora?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4A4A4A;">
          <li>Consultar tu información de nómina</li>
          <li>Crear tickets de soporte técnico</li>
          <li>Acceder a recursos de capacitación</li>
          <li>Mantenerte al día con noticias corporativas</li>
          <li>Gestionar tu perfil profesional</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" class="button" target="_blank" rel="noopener noreferrer">
          🏠 Acceder a la Intranet
        </a>
      </div>
      
      <div style="background: #DCFCE7; border-left: 4px solid #10B981; padding: 16px; margin: 24px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-size: 14px; color: #166534;">
          <strong>💡 Consejo:</strong> Guarda este enlace en tus marcadores para acceder rápidamente a la intranet.
        </p>
      </div>
      
      <p class="message">
        Si tienes alguna pregunta o necesitas ayuda para empezar, no dudes en contactar a nuestro 
        equipo de soporte. Estamos aquí para ayudarte a sacar el máximo provecho de la plataforma.
      </p>
      
      <p style="margin: 30px 0 0 0; color: #4A4A4A;">
        ¡Bienvenido al equipo!<br>
        <strong>Equipo de Coacharte</strong><br>
        <span style="color: #6B7280; font-size: 14px;">Tu éxito es nuestro compromiso</span>
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        <a href="mailto:soporte@coacharte.mx" class="footer-link">soporte@coacharte.mx</a> | 
        <a href="https://coacharte.mx" class="footer-link">www.coacharte.mx</a>
      </p>
      <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} Coacharte. Todos los derechos reservados.
      </p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
};

// Exportaciones por defecto para compatibilidad
export default {
  generateTicketConfirmationEmail,
  generateGeneralEmail,
  generatePasswordResetEmail,
  generateWelcomeEmail
};
