export interface SupportTicket {
  userEmail: string;
  userName: string;
  subject: string;
  // category: 'technical' | 'general' | 'billing' | 'other'; // Se manejará como string genérico
  category: string;
  // priority: 'low' | 'medium' | 'high' | 'urgent'; // Se usará el enum de ZohoDesk
  priority: string; // Cambiado a string para que coincida con el select del formulario
  message: string;
  // attachments?: File[]; // No implementado en el backend actual
}

export interface SupportTicketResponse {
  success: boolean;
  message: string;
  ticketId?: string;
  ticketNumber?: string;
  webUrl?: string;
  categoryReceived?: string;
}

class EmailService {
  /**
   * Envía un ticket de soporte técnico a través del backend API.
   */
  async sendSupportTicket(ticket: SupportTicket): Promise<SupportTicketResponse> {
    try {
      const response = await fetch('/api/email/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Aquí podrías añadir cabeceras de autenticación si son necesarias
        },
        body: JSON.stringify(ticket),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar el ticket desde el cliente');
      }
      
      return {
        success: true,
        message: result.message || 'Ticket enviado exitosamente al backend',
        ticketId: result.ticketId,
        ticketNumber: result.ticketNumber,
        webUrl: result.webUrl,
        categoryReceived: result.categoryReceived,
      };

    } catch (error) {
      console.error('Error enviando ticket de soporte desde el cliente:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al enviar el ticket desde el cliente',
      };
    }
  }

  // La función sendConfirmationToUser ya no es necesaria aquí, el backend la maneja.
  // private generateTicketId(): string { ... } // Ya no es necesaria aquí
  // private getCategoryLabel(...): string { ... } // Ya no es necesaria aquí
  // private getPriorityLabel(...): string { ... } // Ya no es necesaria aquí
}

// Exportar una instancia única del servicio
export const emailService = new EmailService();