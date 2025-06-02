// filepath: /Users/madadeivi/Developer/Coacharte/Intranet/client/src/components/ResetPasswordForm.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ResetPasswordForm.css';

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Token de restablecimiento no válido o ausente.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token) {
      setError('Token de restablecimiento no válido.');
      return;
    }

    try {
      await api.post('/users/reset-password', { token, newPassword: password });
      setMessage('Tu contraseña ha sido restablecida con éxito. Ahora puedes iniciar sesión.');
      // Opcionalmente, redirigir al login después de un breve retraso
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError('Error al restablecer la contraseña. El token puede ser inválido o haber expirado.');
      console.error('Error resetting password:', err);
    }
  };

  return (
    <div className="reset-password-form-container">
      <h2>Restablecer Nueva Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Nueva Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={!token}>Restablecer Contraseña</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
