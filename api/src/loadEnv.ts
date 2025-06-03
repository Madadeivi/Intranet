const dotenv = require('dotenv');
const path = require('path');

// Configurar dotenv
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🔧 Environment variables loaded');

// Exportar usando CommonJS
module.exports = {};
