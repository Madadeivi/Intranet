import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

// Inicializar EmailJS
emailjs.init(EMAILJS_USER_ID);

export interface SupportTicket {
  userEmail: string;
  userName: string;
  subject: string;
  category: 'technical' | 'general' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  attachments?: File[];
}

export interface EmailResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

class EmailService {
  /**
   * Envía un ticket de soporte técnico
   */
  async sendSupportTicket(ticket: SupportTicket): Promise<EmailResponse> {
    try {
      // Generar ID único para el ticket
      const ticketId = this.generateTicketId();
      
      // Preparar los parámetros del template
      const templateParams = {
        to_email: 'support@coacharte.zohodesk.com',
        from_email: ticket.userEmail,
        from_name: ticket.userName,
        ticket_id: ticketId,
        subject: `[Ticket #${ticketId}] ${ticket.subject}`,
        category: this.getCategoryLabel(ticket.category),
        priority: this.getPriorityLabel(ticket.priority),
        message: ticket.message,
        reply_to: ticket.userEmail,
      };

      // Enviar el email
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Ticket enviado exitosamente',
          ticketId,
        };
      }

      throw new Error('Error al enviar el ticket');
    } catch (error) {
      console.error('Error enviando ticket de soporte:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al enviar el ticket',
      };
    }
  }

  /**
   * Envía un correo de confirmación al usuario
   */
  async sendConfirmationToUser(
    userEmail: string,
    userName: string,
    ticketId: string
  ): Promise<EmailResponse> {
    try {
      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        ticket_id: ticketId,
        support_email: 'support@coacharte.zohodesk.com',
      };

      // Aquí podrías usar un template diferente para la confirmación
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID, // Deberías tener un template específico para confirmaciones
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Confirmación enviada',
        };
      }

      throw new Error('Error al enviar confirmación');
    } catch (error) {
      console.error('Error enviando confirmación:', error);
      return {
        success: false,
        message: 'Error al enviar confirmación',
      };
    }
  }

  /**
   * Genera un ID único para el ticket
   */
  private generateTicketId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
  }

  /**
   * Obtiene la etiqueta legible para la categoría
   */
  private getCategoryLabel(category: SupportTicket['category']): string {
    const labels = {
      technical: 'Soporte Técnico',
      general: 'Consulta General',
      billing: 'Facturación',
      other: 'Otro',
    };
    return labels[category] || 'Sin categoría';
  }

  /**
   * Obtiene la etiqueta legible para la prioridad
   */
  private getPriorityLabel(priority: SupportTicket['priority']): string {
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return labels[priority] || 'Sin prioridad';
  }
}

// Exportar una instancia única del servicio
export const emailService = new EmailService();