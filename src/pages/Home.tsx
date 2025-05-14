import React, { useState } from 'react';
import './Home.css';
import logo from '../assets/coacharte-logo.png';
import logoFooter from '../assets/coacharte-bco@4x.png';
import homeOfficeImg from '../assets/home-office.jpeg';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
// Importar iconos rellenos de Material Icons
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import DescriptionIcon from '@mui/icons-material/Description';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import GppGoodIcon from '@mui/icons-material/GppGood';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import SettingsIcon from '@mui/icons-material/Settings';

const Home: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="home-root">
      {/* Header y barra de navegación */}
      <header className="home-header">
        <div className="logo"><img src={logo} alt="Logo Coacharte" className="home-logo-img" /></div>
        <nav className="home-nav">
          <a href="#">Inicio</a>
          <a href="#">Mi Cuenta</a>
          <a href="#">Recursos Humanos</a>
          <a href="#">Procesos</a>
        </nav>
        <div className="home-user">
          <span className="notification-bell" aria-label="Notificaciones">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 20c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V9c0-3.07-1.63-5.64-5-6.32V2a1 1 0 1 0-2 0v.68C6.63 3.36 5 5.92 5 9v5l-1.29 1.29A1 1 0 0 0 5 17h12a1 1 0 0 0 .71-1.71L17 14zM17 15H5v-1.17l1.41-1.41C6.79 12.21 7 11.7 7 11.17V9c0-2.76 1.12-5 4-5s4 2.24 4 5v2.17c0 .53.21 1.04.59 1.42L17 13.83V15z" fill="currentColor"/>
            </svg>
          </span>
          <span className="user-avatar">DD</span>
          <span className="user-name">David Dorantes</span>
          <span className="user-dropdown-arrow" aria-label="Más opciones">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </header>

      {/* Bienvenida y buscador */}
      <section className="home-welcome">
        <div className="home-welcome-month"><span>Mayo 2025</span></div>
        <h1>Bienvenido a tu Intranet</h1>
        <p>Tu espacio central para acceder a todos los recursos y herramientas de Coacharte</p>
        <div className="home-search-wrapper">
          <input
            className="home-search"
            type="text"
            placeholder={searchActive ? '' : 'Buscar recursos, documentos, personas...'}
            onFocus={() => setSearchActive(true)}
            onBlur={e => { if (!e.target.value) setSearchActive(false); }}
          />
          {!searchActive && (
            <span className="home-search-icon" aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
                <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
          </span>
          )}
        </div>
      </section>

      {/* Tarjetas principales */}
      <section className="home-main-cards">
        <div className="card-grid">
          <div className="main-card">
            <span className="main-card-icon" aria-label="Mi Cuenta">
              <AccountCircleIcon fontSize="inherit" />
            </span>
            <h3>Mi Cuenta</h3>
            <p>Gestiona tu perfil, documentos y accesos</p>
          </div>
          <div className="main-card">
            <span className="main-card-icon" aria-label="Recursos Humanos">
              <FolderSpecialIcon fontSize="inherit" />
            </span>
            <h3>Recursos Humanos</h3>
            <p>Nómina, vacaciones y prestaciones</p>
          </div>
          <div className="main-card">
            <span className="main-card-icon" aria-label="Procesos y Documentación">
              <DescriptionIcon fontSize="inherit" />
            </span>
            <h3>Procesos y Documentación</h3>
            <p>Formatos y políticas corporativas</p>
          </div>
          <div className="main-card">
            <span className="main-card-icon" aria-label="Soporte y Comunicación">
              <HeadsetMicIcon fontSize="inherit" />
            </span>
            <h3>Soporte y Comunicación</h3>
            <p>Tickets y material de capacitación</p>
          </div>
          <div className="main-card">
            <span className="main-card-icon" aria-label="Calendario y Eventos">
              <EventIcon fontSize="inherit" />
            </span>
            <h3>Calendario y Eventos</h3>
            <p>Agenda corporativa y actividades</p>
          </div>
          <div className="main-card">
            <span className="main-card-icon" aria-label="Conoce Coacharte">
              <InfoIcon fontSize="inherit" />
            </span>
            <h3>Conoce Coacharte</h3>
            <p>Nuestra cultura y valores</p>
          </div>
        </div>
      </section>

      {/* Avisos importantes */}
      <section className="home-notices">
        <div className='home-notices-span'>
          <h2>Avisos Importantes</h2>
          <div className="notice-grid">
            <div className="notice-card">
              <img className="notice-card-img" src={homeOfficeImg} alt="Política Home Office" />
              <div className="notice-card-content">
                <span className="notice-date">15 Feb 2024</span>
                <h4>Nueva Política de Home Office</h4>
                <p>Actualización de lineamientos para trabajo remoto</p>
                <a href="#">Ver más</a>
              </div>
            </div>
            <div className="notice-card">
              <img className="notice-card-img" src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" alt="Vacunación" />
              <div className="notice-card-content">
                <span className="notice-date">20 Feb 2024</span>
                <h4>Campaña de Vacunación</h4>
                <p>Próxima jornada de vacunación empresarial</p>
                <a href="#">Ver más</a>
              </div>
            </div>
            <div className="notice-card">
              <img className="notice-card-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Actualización de Sistemas" />
              <div className="notice-card-content">
                <span className="notice-date">18 Feb 2024</span>
                <h4>Actualización de Sistemas</h4>
                <p>Mantenimiento programado para el fin de semana</p>
                <a href="#">Ver más</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enlaces rápidos */}
      <section className="home-quicklinks">
        <div className="home-quicklinks-span">
          <h2>Enlaces Rápidos</h2>
          <div className="quicklinks-grid">
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Solicitud de Vacaciones"><DescriptionIcon fontSize="inherit" /></span>Solicitud de Vacaciones</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Cambio de Contraseña"><GppGoodIcon fontSize="inherit" /></span>Cambio de Contraseña</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Portal de Capacitación"><SchoolIcon fontSize="inherit" /></span>Portal de Capacitación</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Directorio Empresarial"><GroupsIcon fontSize="inherit" /></span>Directorio Empresarial</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Soporte Técnico"><HeadsetMicIcon fontSize="inherit" /></span>Soporte Técnico</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Configuración de Cuenta"><SettingsIcon fontSize="inherit" /></span>Configuración de Cuenta</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Calendario de Eventos"><EventIcon fontSize="inherit" /></span>Calendario de Eventos</a>
            <a href="#" className="quicklink"><span className="quicklink-icon" aria-label="Mi Perfil"><AccountCircleIcon fontSize="inherit" /></span>Mi Perfil</a>
          </div>
        </div>
      </section>

      {/* Calendario y próximos eventos */}
      <section className="home-calendar-events">
        <div className="calendar-box">
          <h3>Calendario</h3>
          <Calendar className="coacharte-calendar" locale="es-MX" />
        </div>
        <div className="events-box">
          <h3>Próximos Eventos</h3>
          <ul className="events-list">
            <li>
              <div>
                <span className="event-date">15 Feb 2024 - 10:00 AM</span>
                <span className="event-title">Reunión General</span>
              </div>
              <img className="event-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Evento" />
            </li>
            <li>
              <div>
                <span className="event-date">18 Feb 2024 - 2:00 PM</span>
                <span className="event-title">Capacitación Nuevas Herramientas</span>
              </div>
              <img className="event-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Evento" />
            </li>
            <li>
              <div>
                <span className="event-date">20 Feb 2024 - Todo el día</span>
                <span className="event-title">Día de Pago</span>
              </div>
              <img className="event-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Evento" />
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-col footer-col-logo">
            <img src={logoFooter} alt="Logo Coacharte" className="home-logo-img" />
            <div className="footer-slogan">Transformando el futuro a través del desarrollo humano</div>
          </div>
          <div className="footer-col footer-col-links">
            <h4>Enlaces Útiles</h4>
            <div className="footer-links-list">
              <div>
                <a href="#">Directorio</a>
                <a href="#">Políticas</a>
              </div>
              <div>
                <a href="#">Soporte</a>
                <a href="#">FAQ</a>
              </div>
            </div>
          </div>
          <div className="footer-col footer-col-social">
            <h4>Síguenos</h4>
            <div className="footer-social-icons">
              <a href="#" aria-label="Facebook" className="footer-social-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M21 16h-3v10h-4V16h-2v-4h2v-2c0-2.2 1.3-4 4-4h3v4h-2c-.6 0-1 .4-1 1v1h3l-1 4z" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="footer-social-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="7" y="7" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2"/><circle cx="22.5" cy="9.5" r="1.5" fill="currentColor"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="footer-social-icon">
                <svg width="38" height="32" viewBox="0 0 38 32" fill="none"><rect x="2" y="6" width="34" height="20" rx="6" stroke="currentColor" strokeWidth="2"/><polygon points="16,12 26,16 16,20" fill="currentColor"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copy">© 2025 Coacharte. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
};

export default Home;
