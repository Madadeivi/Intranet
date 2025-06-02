import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LoginForm from './components/LoginForm';
import Home from './pages/Home';
import SetPasswordForm from './components/SetPasswordForm';
import { RequestPasswordResetPage } from './pages/RequestPasswordResetPage';

function App() {
  // Usar basename solo si está definido en las variables de entorno
  const basename = import.meta.env.VITE_BASE_PATH || '';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/set-new-password" element={<SetPasswordForm />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
      </Routes>
      <SpeedInsights />
    </Router>
  );
}

export default App;
