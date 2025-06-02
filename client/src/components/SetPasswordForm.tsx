import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { AuthResult } from '../services/authService';
import './SetPasswordForm.css'; // <--- IMPORTAR EL ARCHIVO CSS

const SetPasswordForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar el body class si es necesario, o añadir uno específico
    document.body.classList.add('set-password-page'); // Opcional
    return () => {
      document.body.classList.remove('set-password-page'); // Opcional
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ text: 'La contraseña debe tener al menos 8 caracteres.', type: 'error' });
      return;
    }

    setIsLoading(true);

    const emailForPasswordChange = localStorage.getItem('emailForPasswordChange');
    // El tempToken no se envía directamente, se asume que el backend lo maneja o que authService lo usa si es necesario.
    // Si tu backend espera el tempToken en el body de set-password, necesitarías recuperarlo aquí también.
    // Por ahora, la implementación de authService.setNewPassword solo toma email y newPassword.

    if (!emailForPasswordChange) {
      setMessage({ text: 'Error: No se encontró el email para el cambio de contraseña. Por favor, intenta iniciar sesión de nuevo.', type: 'error' });
      setIsLoading(false);
      // Considera redirigir a login si falta esta información crítica
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    try {
      const result: AuthResult = await authService.setNewPassword(emailForPasswordChange, newPassword);

      if (result.success) {
        setMessage({ text: 'Contraseña actualizada con éxito. Serás redirigido al inicio de sesión.', type: 'success' });
        localStorage.removeItem('tempToken'); // Limpiar token temporal
        localStorage.removeItem('emailForPasswordChange'); // Limpiar email
        
        setTimeout(() => {
          navigate('/'); // Redirigir a la página de login
        }, 2000);
      } else {
        setMessage({ text: result.message || 'No se pudo actualizar la contraseña.', type: 'error' });
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Un error inesperado ocurrió.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Aplicar la clase 'set-password-page' al body a través de useEffect o a un div contenedor principal aquí
    // Para mantenerlo simple y alineado con LoginForm, asumimos que la clase 'set-password-page' se añade al body
    // y el contenedor principal aquí es para la tarjeta del formulario.
    <div className="set-password-form-card"> {/* Cambiado de set-password-container a set-password-form-card para el estilo del "card" */}
      <h2>Establecer Nueva Contraseña</h2>
      <form onSubmit={handleSubmit} className="set-password-form"> {/* Añadida clase al form */}
        <div className="form-group"> {/* Añadida clase al div */}
          <label htmlFor="newPassword">Nueva Contraseña:</label>
          <input
            type="password"
            id="newPassword"
            className="form-input" /* Añadida clase al input */
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ingresa tu nueva contraseña"
            required
            // style={{ width: '100%', padding: '8px', marginTop: '5px' }} // Estilos en línea eliminados
          />
        </div>
        <div className="form-group"> {/* Añadida clase al div */}
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input" /* Añadida clase al input */
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma tu nueva contraseña"
            required
            // style={{ width: '100%', padding: '8px', marginTop: '5px' }} // Estilos en línea eliminados
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="submit-button" /* Añadida clase al button */
          // style={{ padding: '10px 15px', width: '100%', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} // Estilos en línea eliminados
        >
          {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
      {message.text && (
        <div
          className={`message-container ${message.type === 'error' ? 'message-error' : 'message-success'}`} /* Clases para el mensaje */
          // style={{
          //   marginTop: '20px',
          //   padding: '10px',
          //   color: message.type === 'error' ? 'red' : 'green',
          //   border: message.type ? '1px solid' : 'none',
          //   borderRadius: '4px',
          // }} // Estilos en línea eliminados
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default SetPasswordForm;
