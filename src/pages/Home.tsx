import React, { useState } from 'react';
import './Home.css'; // Puedes crear este archivo para estilos específicos
import logo from '../assets/coacharte-logo.png';

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
          <span className="user-avatar">DD</span>
          <span className="user-name">David Dorantes</span>
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
          <div className="main-card"><span role="img" aria-label="user">👤</span> <h3>Mi Cuenta</h3><p>Gestiona tu perfil, documentos y accesos</p></div>
          <div className="main-card"><span role="img" aria-label="hr">📁</span> <h3>Recursos Humanos</h3><p>Nómina, vacaciones y prestaciones</p></div>
          <div className="main-card"><span role="img" aria-label="docs">📄</span> <h3>Procesos y Documentación</h3><p>Formatos y políticas corporativas</p></div>
          <div className="main-card"><span role="img" aria-label="support">❓</span> <h3>Soporte y Comunicación</h3><p>Tickets y material de capacitación</p></div>
          <div className="main-card"><span role="img" aria-label="calendar">📅</span> <h3>Calendario y Eventos</h3><p>Agenda corporativa y actividades</p></div>
          <div className="main-card"><span role="img" aria-label="about">🏢</span> <h3>Conoce Coacharte</h3><p>Nuestra cultura y valores</p></div>
        </div>
      </section>

      {/* Avisos importantes */}
      <section className="home-notices">
        <h2>Avisos Importantes</h2>
        <div className="notice-grid">
          <div className="notice-card">
            <span className="notice-date">15 Feb 2024</span>
            <h4>Nueva Política de Home Office</h4>
            <p>Actualización de lineamientos para trabajo remoto</p>
            <a href="#">Ver más</a>
          </div>
          <div className="notice-card">
            <span className="notice-date">20 Feb 2024</span>
            <h4>Campaña de Vacunación</h4>
            <p>Próxima jornada de vacunación empresarial</p>
            <a href="#">Ver más</a>
          </div>
          <div className="notice-card">
            <span className="notice-date">18 Feb 2024</span>
            <h4>Actualización de Sistemas</h4>
            <p>Mantenimiento programado para el fin de semana</p>
            <a href="#">Ver más</a>
          </div>
        </div>
      </section>

      {/* Enlaces rápidos */}
      <section className="home-quicklinks">
        <h2>Enlaces Rápidos</h2>
        <div className="quicklinks-grid">
          <a href="#" className="quicklink">Solicitud de Vacaciones</a>
          <a href="#" className="quicklink">Cambio de Contraseña</a>
          <a href="#" className="quicklink">Portal de Capacitación</a>
          <a href="#" className="quicklink">Directorio Empresarial</a>
          <a href="#" className="quicklink">Soporte Técnico</a>
          <a href="#" className="quicklink">Configuración de Cuenta</a>
          <a href="#" className="quicklink">Calendario de Eventos</a>
          <a href="#" className="quicklink">Mi Perfil</a>
        </div>
      </section>

      {/* Calendario y próximos eventos */}
      <section className="home-calendar-events">
        <div className="calendar-box">
          <h3>Calendario</h3>
          {/* Aquí puedes integrar un componente de calendario real */}
          <table className="calendar-table">
            <thead>
              <tr><th>D</th><th>L</th><th>M</th><th>M</th><th>J</th><th>V</th><th>S</th></tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td><td></td><td>1</td><td>2</td><td>3</td></tr>
              <tr><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
              <tr><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td></tr>
              <tr><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td></tr>
              <tr><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td><td>31</td></tr>
            </tbody>
          </table>
        </div>
        <div className="events-box">
          <h3>Próximos Eventos</h3>
          <ul className="events-list">
            <li>
              <span className="event-date">15 Feb 2024 - 10:00 AM</span>
              <span className="event-title">Reunión General</span>
            </li>
            <li>
              <span className="event-date">18 Feb 2024 - 2:00 PM</span>
              <span className="event-title">Capacitación Nuevas Herramientas</span>
            </li>
            <li>
              <span className="event-date">20 Feb 2024 - Todo el día</span>
              <span className="event-title">Día de Pago</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-logo"><img src={logo} alt="Logo Coacharte" className="home-logo-img" /></div>
        <div className="footer-links">
          <div>
            <h4>Enlaces Útiles</h4>
            <a href="#">Directorio</a>
            <a href="#">Políticas</a>
            <a href="#">Soporte</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h4>Síguenos</h4>
            {/* Aquí puedes agregar iconos de redes sociales */}
          </div>
        </div>
        <div className="footer-copy">© 2024 Coacharte. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
};

export default Home;
