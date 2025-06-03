// Script para verificar manualmente que el servidor funciona
const { spawn } = require('child_process');
const axios = require('axios');

console.log('🚀 Iniciando servidor manualmente...');

// Iniciar el servidor
const serverProcess = spawn('npx', ['tsx', 'api/src/server.ts'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

serverProcess.stdout.on('data', (data) => {
  console.log(`📡 ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`❌ ${data.toString().trim()}`);
});

// Esperar un poco para que el servidor inicie
setTimeout(async () => {
  console.log('\n🧪 Probando conectividad del servidor...');
  
  try {
    // Probar health check
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check exitoso:', healthResponse.data);
    
    // Probar endpoint de login
    console.log('\n🔐 Probando endpoint de login...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
        email: 'test@example.com',
        password: 'testpassword'
      });
      console.log('✅ Login endpoint accesible:', loginResponse.status);
    } catch (loginError) {
      if (loginError.response) {
        console.log(`✅ Login endpoint responde (${loginError.response.status}): ${loginError.response.statusText}`);
        console.log('📝 Mensaje:', loginError.response.data.message || loginError.response.data.error);
      } else {
        console.log('❌ Error de conexión al login:', loginError.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Error conectando al servidor:', error.message);
  }
  
  // Terminar el proceso del servidor
  console.log('\n🛑 Deteniendo servidor...');
  serverProcess.kill();
  process.exit(0);
  
}, 3000);

serverProcess.on('close', (code) => {
  console.log(`\n📋 Proceso del servidor terminado con código: ${code}`);
});
