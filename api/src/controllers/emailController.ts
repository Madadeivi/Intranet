import { Request, Response, NextFunction } from 'express';
import * as zohoDeskService from '../services/zohoDeskService';
import { ZohoDeskTicketPriority } from '../services/zohoDeskService';
import { sendEmail } from '../services/emailService'; // Importar sendEmail directamente

interface SupportTicketPayload {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  priority?: ZohoDeskTicketPriority; // Hacerlo opcional y usar el tipo específico
  category?: string; // Recibirlo aunque no se use directamente en Zoho Desk por ahora
}

export const handleSendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { to, subject, html, text } = req.body;

  if (!to || !subject || (!html && !text)) {
    res.status(400).json({ message: 'Missing required fields: to, subject, and html or text.' });
    return; // Asegurar que la función retorna aquí
  }

  try {
    await sendEmail({ to, subject, html, text });
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    next(error);
  }
};

export async function createSupportTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const { userEmail, userName, subject, message, priority, category } = req.body as SupportTicketPayload;

    if (!userEmail || !userName || !subject || !message) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: userEmail, userName, subject, message son requeridos.' });
    }

    const coacharteDepartmentId = process.env.ZOHO_DESK_COACHARTE_DEPARTMENT_ID;
    if (!coacharteDepartmentId) {
      console.error('Error: ZOHO_DESK_COACHARTE_DEPARTMENT_ID no está configurado en .env');
      // Considera no exponer detalles internos del error al cliente en producción
      return res.status(500).json({ message: 'Error de configuración del servidor.' });
    }

    // Datos para crear el ticket en Zoho Desk
    const ticketData: zohoDeskService.CreateTicketPayload = {
      subject,
      description: message,
      priority: priority || ZohoDeskTicketPriority.MEDIUM, // Usar prioridad del payload o MEDIUM por defecto
      contact: {
        email: userEmail,
        lastName: userName, // Asumiendo que userName es el apellido o nombre completo
      },
      departmentId: coacharteDepartmentId,
      // 'category' se recibe pero no se mapea directamente a un campo estándar de Zoho Desk en esta función.
      // Si se necesita, se podría usar para campos personalizados o lógica adicional.
    };

    const ticketResult = await zohoDeskService.createZohoDeskTicket(ticketData);

    // Enviar confirmación por correo electrónico al usuario
    const confirmationSubject = `Confirmación de Ticket de Soporte #${ticketResult.ticketNumber}`;
    const confirmationHtml = `
      <p>Hola ${userName},</p>
      <p>Hemos recibido tu solicitud de soporte. Tu número de ticket es <strong>${ticketResult.ticketNumber}</strong>.</p>
      <p>Categoría reportada: ${category || 'No especificada'}</p>
      <p>Puedes ver el estado de tu ticket y las actualizaciones aquí: <a href="${ticketResult.webUrl}">${ticketResult.webUrl}</a></p>
      <p>Nos pondremos en contacto contigo lo antes posible.</p>
      <p>Gracias,<br>El equipo de Coacharte</p>
    `;

    await sendEmail({
      to: userEmail,
      subject: confirmationSubject,
      html: confirmationHtml,
    });

    res.status(201).json({ 
      success: true, 
      message: 'Ticket de soporte creado exitosamente en Zoho Desk.',
      ticketId: ticketResult.id, 
      ticketNumber: ticketResult.ticketNumber,
      webUrl: ticketResult.webUrl,
      categoryReceived: category, // Devolver la categoría recibida para confirmación si es necesario
    });

  } catch (error) {
    console.error('Error al crear el ticket de soporte via API Desk:', error);
    next(error); 
  }
};
