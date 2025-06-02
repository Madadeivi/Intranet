import dotenv from 'dotenv';

dotenv.config();

console.log('--- Variables de entorno en loadEnv.ts (después de dotenv.config()) ---');
console.log('ZOHO_API_URL:', process.env.ZOHO_API_URL);
console.log('ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID);
console.log('ZOHO_CLIENT_SECRET:', process.env.ZOHO_CLIENT_SECRET ? '****' + process.env.ZOHO_CLIENT_SECRET.slice(-4) : 'NO Cargado');
console.log('ZOHO_REFRESH_TOKEN:', process.env.ZOHO_REFRESH_TOKEN);
console.log('ZOHO_CRM_ORG_ID:', process.env.ZOHO_CRM_ORG_ID);
console.log('JWT_SECRET (loadEnv.ts):', process.env.JWT_SECRET ? 'Cargado' : 'NO Cargado');
console.log('-------------------------------------------------------------------');
