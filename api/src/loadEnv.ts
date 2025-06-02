import dotenv from 'dotenv';

dotenv.config();

// Función para logging seguro de variables de entorno
function logEnvironmentStatus() {
  const requiredVars = [
    'ZOHO_API_URL',
    'ZOHO_CLIENT_ID', 
    'ZOHO_CLIENT_SECRET',
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_CRM_ORG_ID',
    'JWT_SECRET'
  ];

  console.log('--- Estado de Variables de Entorno ---');
  
  // Solo mostrar si las variables están cargadas, sin exponer valores
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`${varName}: ✓ Cargada`);
    } else {
      console.log(`${varName}: ✗ NO Cargada`);
    }
  });

  // Solo mostrar URLs en desarrollo (no contienen secretos)
  if (process.env.NODE_ENV === 'development' && process.env.ZOHO_API_URL) {
    console.log(`ZOHO_API_URL: ${process.env.ZOHO_API_URL}`);
  }

  console.log('----------------------------------------');
}

// Ejecutar logging seguro
logEnvironmentStatus();
