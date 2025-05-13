import React, { useState } from 'react';
import authService, { AuthResult, LoginCredentials } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/coacharte-logo.png';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ 
    text: '', 
    type: '' 
  });
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setIsLoading(true);
    try {
      const credentials: LoginCredentials = { username, password };
      const result: AuthResult = await authService.login(credentials);
      if (result.success && result.user) {
        setMessage({ 
          text: `Bienvenido, ${result.user.fullName || result.user.username}!`, 
          type: 'success' 
        });
        setTimeout(() => {
          navigate('/home');
        }, 1000);
        setUsername('');
        setPassword('');
      } else {
        setMessage({ 
          text: result.message || 'Fallo de inicio de sesión, revise sus credenciales.', 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: error instanceof Error ? error.message : 'Un error inesperado ocurrió.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <img src={logo} alt="Logo Coacharte" className="login-logo" />
      <h2>Coacharte Intranet - Inicio de sesión</h2>
      <form onSubmit={handleSubmit} className='login-form'>
        <div className="form-group">
          <label htmlFor="username">Nombre de usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default LoginForm;

