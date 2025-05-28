import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LoginForm from './components/LoginForm';
import Home from './pages/Home';

function App() {
  return (
    <Router basename={import.meta.env.VITE_BASE_PATH || '/Intranet'}>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
      </Routes>
      <SpeedInsights />
    </Router>
  );
}

export default App;
