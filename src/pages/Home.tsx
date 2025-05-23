import React, { useState, useEffect, useRef } from 'react';
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
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const SupportModal = React.forwardRef<HTMLDivElement, { userInfo: { firstName: string; lastName: string; email: string } | null; onClose: () => void }>((props, ref) => {
  const { userInfo, onClose } = props;
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');

  const handleSend = () => {
    if (!subject || !description) {
      alert('Por favor, complete todos los campos antes de enviar.');
      return;
    }

    const templateParams = {
      subject: `[${urgency}] ${subject}`,
      description,
      user_name: `${userInfo?.firstName} ${userInfo?.lastName}`,
      user_email: userInfo?.email,
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      )
      .then(
        (response) => {
          console.log('Correo enviado exitosamente:', response.status, response.text);
          alert('El ticket de soporte ha sido enviado exitosamente.');
          onClose();
        },
        (error) => {
          console.error('Error al enviar el correo:', error);
          alert('Hubo un problema al enviar el ticket. Por favor, intente nuevamente.');
        }
      );
  };

  return (
    <div className="modal-overlay">
      <div className="modal" ref={ref}>
        <h2>Crear Ticket de Soporte</h2>
        <div className="input-group">
          <label htmlFor="subject">Asunto:</label>
          <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="description">Descripción del problema:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="input-group">
          <label htmlFor="urgency">Nivel de urgencia:</label>
          <select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="Urgente">Urgente</option>
            <option value="Normal">Normal</option>
            <option value="Soporte">Soporte</option>
            <option value="Información">Información</option>
          </select>
        </div>
        <div className="button-group">
          <button onClick={handleSend}>Enviar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
});

const Home: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; initials: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('coacharteUserInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserInfo({ ...parsed, email: parsed.email || '' });
      console.log('Datos de usuario cargados:', parsed); // Depuración
    } else {
      console.log('No se encontraron datos de usuario.'); // Depuración
    }
  }, []);

  // Cerrar menú si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Cerrar modal de soporte si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsSupportModalOpen(false);
      }
    }

    if (isSupportModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSupportModalOpen]);

  // Handler para logout
  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem('coacharteUserInfo');
    setUserInfo(null);
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="home-root">
      {/* Header y barra de navegación */}
      <header className="home-header">
        <div className="logo"><img src={logo} alt="Logo Coacharte" className="home-logo-img" loading="lazy" /></div>
        <nav className="home-nav">
          <a href="#" onClick={e => { e.preventDefault(); navigate('/home'); }}>Inicio</a>
          <a href="#">Mi Cuenta</a>
          <a href="#">Recursos Humanos</a>
          <a href="#">Procesos</a>
        </nav>
        <div className="home-user" ref={dropdownRef}>
          <span className="notification-bell" aria-label="Notificaciones">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 20c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V9c0-3.07-1.63-5.64-5-6.32V2a1 1 0 1 0-2 0v.68C6.63 3.36 5 5.92 5 9v5l-1.29 1.29A1 1 0 0 0 5 17h12a1 1 0 0 0 .71-1.71L17 14zM17 15H5v-1.17l1.41-1.41C6.79 12.21 7 11.7 7 11.17V9c0-2.76 1.12-5 4-5s4 2.24 4 5v2.17c0 .53.21 1.04.59 1.42L17 13.83V15z" fill="currentColor"/>
            </svg>
          </span>
          <span className="user-avatar">{userInfo?.initials}</span>
          <span className="user-name">{userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : ''}</span>
          <span className="user-dropdown-arrow" aria-label="Más opciones" onClick={() => setDropdownOpen(v => !v)} title="Opciones de usuario">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <button className="user-dropdown-item" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </header>

      {/* Bienvenida y buscador */}
      <section className="home-welcome">
        <div className="home-welcome-content">
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
              <img className="notice-card-img" src={homeOfficeImg} alt="Política Home Office" loading="lazy" />
              <div className="notice-card-content">
                <span className="notice-date">15 Feb 2024</span>
                <h4>Nueva Política de Home Office</h4>
                <p>Actualización de lineamientos para trabajo remoto</p>
                <a href="#">Ver más</a>
              </div>
            </div>
            <div className="notice-card">
              <img className="notice-card-img" src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" alt="Vacunación" loading="lazy" />
              <div className="notice-card-content">
                <span className="notice-date">20 Feb 2024</span>
                <h4>Campaña de Vacunación</h4>
                <p>Próxima jornada de vacunación empresarial</p>
                <a href="#">Ver más</a>
              </div>
            </div>
            <div className="notice-card">
              <img className="notice-card-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Actualización de Sistemas" loading="lazy" />
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
            <a href="#" className="quicklink" onClick={(e) => { e.preventDefault(); setIsSupportModalOpen(true); }}>
              <span className="quicklink-icon" aria-label="Soporte Técnico"><HeadsetMicIcon fontSize="inherit" /></span>Soporte Técnico
            </a>
            <a href={`https://nomina.coacharte.mx/user.php?email=${userInfo?.email}`} className="quicklink" target="_blank" rel="noopener noreferrer">
              <span className="quicklink-icon" aria-label="Consulta Nómina">
                <SettingsIcon fontSize="inherit" />
              </span>
              Consulta Nómina
            </a>
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
              <img className="event-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Evento" loading="lazy" />
            </li>
            <li>
              <div>
                <span className="event-date">18 Feb 2024 - 2:00 PM</span>
                <span className="event-title">Capacitación Nuevas Herramientas</span>
              </div>
              <img className="event-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Evento" loading="lazy" />
            </li>
            <li>
              <div>
                <span className="event-date">20 Feb 2024 - Todo el día</span>
                <span className="event-title">Día de Pago</span>
              </div>
              <img className="event-img" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80" alt="Evento" loading="lazy" />
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-col footer-col-logo">
            <img src={logoFooter} alt="Logo Coacharte" className="home-logo-img" loading="lazy" />
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
                <FacebookIcon fontSize="inherit" />
              </a>
              <a href="#" aria-label="Instagram" className="footer-social-icon">
                <InstagramIcon fontSize="inherit" />
              </a>
              <a href="#" aria-label="YouTube" className="footer-social-icon">
                <YouTubeIcon fontSize="inherit" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copy">© 2025 Coacharte. Todos los derechos reservados.</div>
      </footer>

      {/* Modal de soporte técnico */}
      {isSupportModalOpen && userInfo && (
        <SupportModal
          userInfo={{ firstName: userInfo.firstName, lastName: userInfo.lastName, email: userInfo.email }}
          onClose={() => setIsSupportModalOpen(false)}
          ref={modalRef}
        />
      )}
    </div>
  );
};

export default Home;
