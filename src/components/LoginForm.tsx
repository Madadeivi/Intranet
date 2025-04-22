import React, { useState } from 'react';
import '../App.css';
import authService, { AuthResult, LoginCredentials } from '../services/authService';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ 
    text: '', 
    type: '' 
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset any previous messages
    setMessage({ text: '', type: '' });
    setIsLoading(true);
    
    try {
      const credentials: LoginCredentials = { username, password };
      const result: AuthResult = await authService.login(credentials);
      
      if (result.success && result.user) {
        setMessage({ 
          text: `Welcome, ${result.user.fullName || result.user.username}!`, 
          type: 'success' 
        });
        
        // In a real app, you might redirect to a dashboard or home page
        // For example: navigate('/dashboard');
        console.log('Login successful', result.user);
        
        // Reset form
        setUsername('');
        setPassword('');
      } else {
        setMessage({ 
          text: result.message || 'Login failed. Please check your credentials.', 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: error instanceof Error ? error.message : 'An unexpected error occurred', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login to Coacharte Intranet</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          {isLoading ? 'Logging in...' : 'Login'}
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

