import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual del módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar dotenv para buscar el .env en el directorio api
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Función para logging seguro de variables de entorno
function logEnvironmentStatus() {
  const requiredVars = [
    'ZOHO_API_URL',
    'ZOHO_CLIENT_ID', 
    'ZOHO_CLIENT_SECRET',
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_CRM_ORG_ID',
    'JWT_SECRET',
    'CLIENT_URL_FROM_ENV'
  ];

  console.log('--- Estado de Variables de Entorno ---');
  
  // Solo mostrar si las variables están cargadas, sin exponer valores
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log('%s: ✓ Cargada', varName);
    } else {
      console.log('%s: ✗ NO Cargada', varName);
    }
  });

  // Solo mostrar URLs en desarrollo (no contienen secretos)
  if (process.env.NODE_ENV === 'development') {
    if (process.env.ZOHO_API_URL) {
      console.log('ZOHO_API_URL: %s', process.env.ZOHO_API_URL);
    }
    if (process.env.CLIENT_URL_FROM_ENV) {
      console.log('CLIENT_URL_FROM_ENV: %s', process.env.CLIENT_URL_FROM_ENV);
    }
  }

  console.log('----------------------------------------');
}

// Ejecutar logging seguro
logEnvironmentStatus();
