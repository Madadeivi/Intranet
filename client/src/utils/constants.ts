/**
 * Constantes de la aplicación
 */

// Tarjetas deshabilitadas por defecto
export const DISABLED_CARDS = [
  "Mi Cuenta",
  "Recursos Humanos",
  "Procesos y Documentación",
  "Soporte y Comunicación",
  "Calendario y Eventos",
  "Conoce Coacharte"
];

// Eventos del calendario
export const CALENDAR_EVENTS = [
  { date: new Date(2025, 5, 15), name: "Día del Padre" },
  { date: new Date(2025, 5, 3), name: "Evento de Integración" },
  { date: new Date(2025, 5, 13), name: "Pago de Nómina" },
  { date: new Date(2025, 5, 30), name: "Pago de Nómina" }
];

// Configuración del carrusel
export const CAROUSEL_SCROLL_OFFSET = 320;

// URLs externas
export const NOMINA_BASE_URL = 'https://nomina.coacharte.mx/user.php';