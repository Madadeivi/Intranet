import React, { useState } from 'react';
import { emailService, SupportTicket } from '../services/emailService';

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
          message: `Ticket creado exitosamente. ID: ${response.ticketId}`,
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Soporte Técnico</h2>
      
      {submitStatus.type && (
        <div
          className={`mb-4 p-4 rounded ${
            submitStatus.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <p>{submitStatus.message}</p>
          {submitStatus.ticketId && (
            <p className="mt-2 text-sm">
              Recibirás una confirmación en tu correo: {userEmail}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Asunto
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Breve descripción del problema"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="technical">Soporte Técnico</option>
              <option value="general">Consulta General</option>
              <option value="billing">Facturación</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Descripción detallada
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Por favor, describe tu problema o consulta en detalle..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Tu información de contacto:</strong>
          </p>
          <p className="text-sm text-gray-600">Nombre: {userName}</p>
          <p className="text-sm text-gray-600">Email: {userEmail}</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Ticket de Soporte'}
        </button>
      </form>
    </div>
  );
};

export default SupportForm;