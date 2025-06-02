import React, { useState, useEffect, useRef, RefObject } from 'react'; // Importar RefObject
import 'react-calendar/dist/Calendar.css';
import './Home.css';
import logo from '../assets/coacharte-logo.png';
import logoFooter from '../assets/coacharte-bco@4x.png';
import importantArticle1 from '../assets/banner_padre.png';
import importantArticle2 from '../assets/banner_bono.png';
import importantArticle3 from '../assets/banner_ajuste.png';
import importantArticle4 from '../assets/banner_modelo.png';
import Calendar from 'react-calendar';
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuIcon from '@mui/icons-material/Menu'; // Importar MenuIcon
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import SupportForm from '../components/SupportForm';
import { parseBoldAndBreaks } from '../utils/textParser';
import { getCurrentMonthYear } from '../utils/dateUtils';
import { scrollCarousel, checkCarouselScrollability, setupTouchGestures } from '../utils/carouselUtils';
import { DISABLED_CARDS, CALENDAR_EVENTS, CAROUSEL_SCROLL_OFFSET, NOMINA_BASE_URL } from '../utils/constants';

const navItems = [
  { label: 'Inicio', href: '/home', action: (navigate: Function) => navigate('/home') },
  { label: 'Mi Cuenta', href: '#' },
  { label: 'Recursos Humanos', href: '#' },
  { label: 'Procesos', href: '#' },
];

const SupportModal = React.forwardRef<HTMLDivElement, { userInfo: { firstName: string; lastName: string; email: string } | null; onClose: () => void }>((props, ref) => {
  const { userInfo, onClose } = props;

  return (
    <div className="modal-overlay">
      <div className="modal support-form-modal" ref={ref}>
        <button 
          className="modal-close-button" 
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {userInfo && (
          <SupportForm 
            userEmail={userInfo.email}
            userName={`${userInfo.firstName} ${userInfo.lastName}`}
          />
        )}
      </div>
    </div>
  );
});

const NoticeDetailModal: React.FC<{ open: boolean; onClose: () => void; title: string; detail: string; }> = ({ open, onClose, title, detail }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <h2>{title}</h2>
        <p className="notice-detail-text">{parseBoldAndBreaks(detail)}</p>
        <div className="button-group">
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; initials: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú de hamburguesa
  const [disabledCards] = useState<string[]>(DISABLED_CARDS); // Utilizar constante, remover setDisabledCards si no se usa
  const [eventDates] = useState<Date[]>(CALENDAR_EVENTS.map(event => event.date)); // Utilizar constante, remover setEventDates si no se usa
  const [noticeModal, setNoticeModal] = useState<{ open: boolean; title: string; detail: string }>({ open: false, title: '', detail: '' });
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

  // Cerrar menú móvil si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      console.log('Menú móvil abierto, escuchando clics fuera');
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem('coacharteUserInfo');
    setUserInfo(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const currentMonthYearText = getCurrentMonthYear();

  const tileClassName = ({ date }: { date: Date }) => {
    if (eventDates.some(eventDate => eventDate.toDateString() === date.toDateString())) {
      return 'event-day';
    }
    return null;
  };

  const noticeCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null); // Ref para el menú móvil

  const handleScroll = () => {
    const el = noticeCarouselRef.current;
    const { canScrollLeft: newCanScrollLeft, canScrollRight: newCanScrollRight } = checkCarouselScrollability(el);
    setCanScrollLeft(newCanScrollLeft);
    setCanScrollRight(newCanScrollRight);
  };

  const scrollBy = (offset: number) => {
    scrollCarousel(noticeCarouselRef as RefObject<HTMLElement>, offset);
  };

  useEffect(() => {
    const cleanup = setupTouchGestures(noticeCarouselRef as RefObject<HTMLElement>);
    return cleanup;
  }, [noticeCarouselRef]);

  useEffect(() => {
    const el = noticeCarouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-root">
      {/* Header y barra de navegación */}
      <header className="home-header">
        <div className="logo"><img src={logo} alt="Logo Coacharte" className="home-logo-img" loading="lazy" /></div>
        <nav className="home-nav">
          {navItems.map(item => (
            <a 
              key={item.label} 
              href={item.href} 
              onClick={e => { 
                if (item.action) {
                  e.preventDefault();
                  item.action(navigate);
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="home-user" ref={dropdownRef}>
          <span className="notification-bell" aria-label="Notificaciones">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 20c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V9c0-3.07-1.63-5.64-5-6.32V2a1 1 0 1 0-2 0v.68C6.63 3.36 5 5.92 5 9v5l-1.29 1.29A1 1 0 0 0 5 17h12a1 1 0 0 0 .71-1.71L17 14zM17 15H5v-1.17l1.41-1.41C6.79 12.21 7 11.7 7 11.17V9c0-2.76 1.12-5 4-5s4 2.24 4 5v2.17c0 .53.21 1.04.59 1.42L17 13.83V15z" fill="currentColor" />
            </svg>
          </span>
          <span className="user-avatar">{userInfo?.initials}</span>
          <span className="user-name">{userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : ''}</span>
          <span className="user-dropdown-arrow" aria-label="Más opciones" onClick={() => setDropdownOpen(v => !v)} title="Opciones de usuario">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <button className="user-dropdown-item" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          )}
          {/* Menú de hamburguesa para mobile */}
          <div className="hamburger-menu" onClick={() => setIsMobileMenuOpen(v => !v)}>
            <MenuIcon />
          </div>
        </div>
      </header>
      {/* Menú de navegación móvil */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-menu" ref={mobileMenuRef}>
          {navItems.map(item => (
            <a 
              key={item.label} 
              href={item.href} 
              onClick={e => { 
                if (item.action) {
                  e.preventDefault();
                  item.action(navigate);
                }
                setIsMobileMenuOpen(false); 
              }}
            >
              {item.label}
            </a>
          ))}
          {/* Considerar añadir "Cerrar Sesión" aquí también o solo en el dropdown de usuario */}
        </div>
      )}

      {/* Bienvenida y buscador */}
      <section className="home-welcome">
        <div className="home-welcome-content">
          <div className="home-welcome-month">
            <span>{currentMonthYearText}</span>
          </div>
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
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" />
                  <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Tarjetas principales */}
      <section className="home-main-cards">
        <div className="card-grid">
          <div className={`main-card ${disabledCards.includes("Mi Cuenta") ? "disabled" : ""}`}>
            <span className="main-card-icon" aria-label="Mi Cuenta">
              <AccountCircleIcon fontSize="inherit" />
            </span>
            <h3>Mi Cuenta</h3>
            <p>Gestiona tu perfil, documentos y accesos</p>
          </div>
          <div className={`main-card ${disabledCards.includes("Recursos Humanos") ? "disabled" : ""}`}>
            <span className="main-card-icon" aria-label="Recursos Humanos">
              <FolderSpecialIcon fontSize="inherit" />
            </span>
            <h3>Recursos Humanos</h3>
            <p>Nómina, vacaciones y prestaciones</p>
          </div>
          <div className={`main-card ${disabledCards.includes("Procesos y Documentación") ? "disabled" : ""}`}>
            <span className="main-card-icon" aria-label="Procesos y Documentación">
              <DescriptionIcon fontSize="inherit" />
            </span>
            <h3>Procesos y Documentación</h3>
            <p>Formatos y políticas corporativas</p>
          </div>
          <div className={`main-card ${disabledCards.includes("Soporte y Comunicación") ? "disabled" : ""}`}>
            <span className="main-card-icon" aria-label="Soporte y Comunicación">
              <HeadsetMicIcon fontSize="inherit" />
            </span>
            <h3>Soporte y Comunicación</h3>
            <p>Tickets y material de capacitación</p>
          </div>
          <div className={`main-card ${disabledCards.includes("Calendario y Eventos") ? "disabled" : ""}`}>
            <span className="main-card-icon" aria-label="Calendario y Eventos">
              <EventIcon fontSize="inherit" />
            </span>
            <h3>Calendario y Eventos</h3>
            <p>Agenda corporativa y actividades</p>
          </div>
          <div className={`main-card ${disabledCards.includes("Conoce Coacharte") ? "disabled" : ""}`}>
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
          <div className="notice-carousel-wrapper">
            <button
              className="notice-carousel-arrow left"
              onClick={() => scrollBy(-CAROUSEL_SCROLL_OFFSET)} // Utilizar constante y función de utilidad
              disabled={!canScrollLeft}
              aria-label="Anterior"
            >
              <ArrowBackIosNewIcon />
            </button>
            <div className="notice-carousel" ref={noticeCarouselRef}>
              <div className="notice-grid notice-carousel-track">
                <div className="notice-card">
                  <img className="notice-card-img" src={importantArticle1} alt="Dia del padre" loading="lazy" />
                  <div className="notice-card-content">
                    <span className="notice-date">15 Jun 2025</span>
                    <h4>Banner día del padre</h4>
                    <p>Féliz día a los papás Coacharteanos!!!</p>
                    <a href="#" onClick={e => { e.preventDefault(); setNoticeModal({ open: true, title: 'Banner día del padre', detail: 'Hoy celebramos a los papás que forman parte de nuestra organización.\nA ustedes, que equilibran reuniones, proyectos y responsabilidades con su papel más importante: ser guías, protectores y ejemplo de dedicación para sus familias.\n\n**¡Feliz Día del Padre!** De todos los que hacemos Coacharte.' }); }}>Ver más</a>
                  </div>
                </div>
                <div className="notice-card">
                  <img className="notice-card-img" src={importantArticle2} alt="Bono 2024" loading="lazy" />
                  <div className="notice-card-content">
                    <span className="notice-date">Junio 2025</span>
                    <h4>Bono 2024</h4>
                    <p>Bono 2024 derivado de los resultados de la evaluación.</p>
                    <a href="#" onClick={e => { e.preventDefault(); setNoticeModal({ open: true, title: 'Bono 2024', detail: 'A partir de junio de 2025, todos los colaboradores **evaluados durante el período 2024** que hayan obtenido una calificación satisfactoria, según las insignias establecidas, recibirán el depósito por concepto de BONO correspondiente al ejercicio fiscal 2024.' }); }}>Ver más</a>
                  </div>
                </div>
                <div className="notice-card">
                  <img className="notice-card-img" src={importantArticle3} alt="Ajuste salarial" loading="lazy" />
                  <div className="notice-card-content">
                    <span className="notice-date">Junio 2025</span>
                    <h4>Ajuste salarial</h4>
                    <p>Ajuste salarial derivado de la inflación 2024.</p>
                    <a href="#" onClick={e => { e.preventDefault(); setNoticeModal({ open: true, title: 'Ajuste salarial', detail: 'En reconocimiento a su compromiso y esfuerzo, les informamos que, **a partir de la segunda quincena del mes de MAYO 2025**, se realizará un ajuste salarial del **3.5%** derivado de la inflación correspondiente al año **2024** y al incremento recibido por nuestros clientes en el mismo mes.\n\nEste ajuste aplicará a todos los colaboradores que se han mantenido activos en nuestra nómina desde el **2024**.' }); }}>Ver más</a>
                  </div>
                </div>
                <div className="notice-card">
                  <img className="notice-card-img" src={importantArticle4} alt="Modelo de cultura integral" loading="lazy" />
                  <div className="notice-card-content">
                    <span className="notice-date">Junio 2025</span>
                    <h4>Modelo de cultura integral</h4>
                    <p>La cultura organizacional en Coacharte la hacemos todos y todas.</p>
                    <a href="#" onClick={e => { e.preventDefault(); setNoticeModal({ open: true, title: 'Modelo de cultura integral', detail: '**Nuestro propósito organizacional** es "Transformar cualquier reto en logro"\n**Nuestros valores** son los barandales que guían nuestras acciones y tienen un significado muy preciso:\n**PERSONAS:** lo más importante son las relaciones sanas con nuestros colegas y clientes.\n**INSPIRAMOS CONFIANZA:** actuando con honestidad, comunicándonos asertivamente y cumpliendo los acuerdos establecidos.\n**VOCACIÓN DE SERVICIO:** disponibilidad para escuchar, leer, atender y proponer siempre desde la empatía.\n\n**Los comportamientos** son las acciones precisas que están asociadas a cada valor para asegurar que tod@s los coachartean@s contribuyamos al logro de los objetivos organizacionales en cada momento clave.' }); }}>Ver más</a>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="notice-carousel-arrow right"
              onClick={() => scrollBy(CAROUSEL_SCROLL_OFFSET)}
              disabled={!canScrollRight}
              aria-label="Siguiente"
            >
              <ArrowForwardIosIcon />
            </button>
          </div>
        </div>
      </section>
      <NoticeDetailModal open={noticeModal.open} onClose={() => setNoticeModal({ ...noticeModal, open: false })} title={noticeModal.title} detail={noticeModal.detail} />

      {/* Enlaces rápidos */}
      <section className="home-quicklinks">
        <div className="home-quicklinks-span">
          <h2>Enlaces Rápidos</h2>
          <div className="quicklinks-grid">
            <a href="#" className="quicklink disabled"><span className="quicklink-icon" aria-label="Solicitud de Vacaciones"><DescriptionIcon fontSize="inherit" /></span>Solicitud de Vacaciones</a>
            <a href="#" className="quicklink disabled"><span className="quicklink-icon" aria-label="Cambio de Contraseña"><GppGoodIcon fontSize="inherit" /></span>Cambio de Contraseña</a>
            <a href="#" className="quicklink disabled"><span className="quicklink-icon" aria-label="Portal de Capacitación"><SchoolIcon fontSize="inherit" /></span>Portal de Capacitación</a>
            <a href="#" className="quicklink disabled"><span className="quicklink-icon" aria-label="Directorio Empresarial"><GroupsIcon fontSize="inherit" /></span>Directorio Empresarial</a>
            <a href="#" className="quicklink" onClick={(e) => { e.preventDefault(); setIsSupportModalOpen(true); }}>
              <span className="quicklink-icon" aria-label="Soporte Técnico"><HeadsetMicIcon fontSize="inherit" /></span>Soporte Técnico
            </a>
            <a href={`${NOMINA_BASE_URL}?email=${userInfo?.email}`} className="quicklink" target="_blank" rel="noopener noreferrer">
              <span className="quicklink-icon" aria-label="Consulta Nómina">
                <SettingsIcon fontSize="inherit" />
              </span>
              Consulta Nómina
            </a>
            <a href="#" className="quicklink disabled"><span className="quicklink-icon" aria-label="Calendario de Eventos"><EventIcon fontSize="inherit" /></span>Calendario de Eventos</a>
            <a href="#" className="quicklink disabled"><span className="quicklink-icon" aria-label="Mi Perfil"><AccountCircleIcon fontSize="inherit" /></span>Mi Perfil</a>
          </div>
        </div>
      </section>

      {/* Calendario y próximos eventos */}
      <section className="home-calendar-events">
        <div className="calendar-box">
          <h3>Calendario</h3>
          <Calendar
            className="coacharte-calendar"
            locale="es-MX"
            tileClassName={tileClassName}
          />
        </div>
        <div className="events-box">
          <h3>Próximos Eventos</h3>
          <div className="events-carousel-vertical">
            <ul className="events-list">
              {[
                {
                  date: new Date(2025, 5, 2),
                  label: '02 Junio 2025',
                  title: 'Lanzamiento Intranet',
                  img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
                  alt: 'Lanzamiento Intranet',
                },
                {
                  date: new Date(2025, 5, 13),
                  label: '13 Junio 2025 - Todo el día',
                  title: 'Pago de Nómina',
                  img: 'https://images.unsplash.com/photo-1556740772-1a741367b93e?auto=format&fit=crop&w=400&q=80',
                  alt: 'Pago de Nómina',
                },
                {
                  date: new Date(2025, 5, 15),
                  label: '15 Junio 2025 - Todo el día',
                  title: 'Día del Padre',
                  img: 'https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&w=400&q=80',
                  alt: 'Día del Padre',
                },
                {
                  date: new Date(2025, 5, 30),
                  label: '30 Junio 2025 - Todo el día',
                  title: 'Pago de Nómina',
                  img: 'https://images.unsplash.com/photo-1556740772-1a741367b93e?auto=format&fit=crop&w=400&q=80',
                  alt: 'Pago de Nómina',
                },
                {
                  date: new Date(2025, 5, 3),
                  label: 'Junio 2025',
                  title: 'Evento de Integración',
                  img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
                  alt: 'Evento de Integración',
                },
              ]
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event, idx) => (
                  <li key={idx}>
                    <div>
                      <span className="event-date">{event.label}</span>
                      <span className="event-title">{event.title}</span>
                    </div>
                    <img className="event-img" src={event.img} alt={event.alt} loading="lazy" />
                  </li>
                ))}
            </ul>
          </div>
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
