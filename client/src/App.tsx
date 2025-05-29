import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LoginForm from './components/LoginForm';
import Home from './pages/Home';

function App() {
  // Usar basename solo si está definido en las variables de entorno
  const basename = import.meta.env.VITE_BASE_PATH || '';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
      </Routes>
      <SpeedInsights />
    </Router>
  );
}

export default App;
