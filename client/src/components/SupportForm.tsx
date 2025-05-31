import React, { useState } from 'react';
import { emailService, SupportTicket } from '../services/emailService';
import './SupportForm.css';

interface SupportFormProps {
  userEmail: string;
  userName: string;
}

const SupportForm: React.FC<SupportFormProps> = ({ userEmail, userName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    ticketId?: string;
  }>({ type: null, message: '' });

  const [formData, setFormData] = useState<Omit<SupportTicket, 'userEmail' | 'userName'>>({
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Enviar el ticket
      const response = await emailService.sendSupportTicket({
        ...formData,
        userEmail,
        userName,
      });

      if (response.success && response.ticketId) {
        // Enviar confirmación al usuario
        await emailService.sendConfirmationToUser(userEmail, userName, response.ticketId);
        
        setSubmitStatus({
          type: 'success',
          message: `Ticket creado exitosamente`,
          ticketId: response.ticketId,
        });
        
        // Limpiar el formulario
        setFormData({
          subject: '',
          category: 'technical',
          priority: 'medium',
          message: '',
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: response.message,
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Error inesperado al enviar el ticket',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="support-form-container">
      <div className="support-form-header">
        <h2 className="support-form-title">Crear Ticket de Soporte</h2>
        <p className="support-form-subtitle">
          Completa el formulario y nuestro equipo te contactará lo antes posible
        </p>
      </div>
      
      {submitStatus.type && (
        <div className={`support-form-alert ${submitStatus.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <div className="alert-content">
            <strong>{submitStatus.type === 'success' ? '✓ Éxito' : '✗ Error'}</strong>
            <p>{submitStatus.message}</p>
            {submitStatus.ticketId && (
              <div className="ticket-info">
                <span className="ticket-label">ID del Ticket:</span>
                <span className="ticket-id">{submitStatus.ticketId}</span>
                <p className="ticket-note">Recibirás una confirmación en: <strong>{userEmail}</strong></p>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Asunto <span className="required">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Breve descripción del problema"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="technical">🔧 Soporte Técnico</option>
              <option value="general">💬 Consulta General</option>
              <option value="nomina">💳 Nómina</option>
              <option value="other">📋 Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={`form-select ${getPriorityClass(formData.priority)}`}
              disabled={isSubmitting}
            >
              <option value="low">🟢 Baja</option>
              <option value="medium">🟡 Media</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Descripción detallada <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="form-textarea"
            placeholder="Por favor, describe tu problema o consulta en detalle..."
            disabled={isSubmitting}
          />
          <span className="form-hint">
            Proporciona todos los detalles relevantes para ayudarnos a resolver tu solicitud más rápidamente
          </span>
        </div>

        <div className="user-info-card">
          <div className="user-info-header">
            <span className="user-info-icon">👤</span>
            <h3>Información de contacto</h3>
          </div>
          <div className="user-info-details">
            <div className="info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{userName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{userEmail}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-button ${isSubmitting ? 'button-loading' : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Enviando...
            </>
          ) : (
            <>
              <span className="button-icon">📨</span>
              Enviar Ticket de Soporte
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SupportForm;