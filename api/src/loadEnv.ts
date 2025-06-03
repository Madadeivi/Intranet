const dotenv = require('dotenv');
const path = require('path');

// En CommonJS, __dirname ya está disponible
const envPath = path.join(__dirname, '..', '.env');

// Configurar dotenv
dotenv.config({ path: envPath });

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
  
  requiredVars.forEach((varName: string) => {
    const value = process.env[varName];
    if (value) {
      console.log('%s: ✓ Cargada', varName);
    } else {
      console.log('%s: ✗ NO Cargada', varName);
    }
  });

  // Solo mostrar URLs en desarrollo
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

// Ejecutar logging
logEnvironmentStatus();

// Exportar usando CommonJS
module.exports = {};
