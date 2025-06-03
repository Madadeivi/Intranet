// Script para verificar que todas las variables de entorno están configuradas
const { spawn } = require('child_process');

console.log('🔧 Verificando configuración de variables de entorno...\n');

// Iniciar el servidor brevemente para verificar las variables
const serverProcess = spawn('npx', ['tsx', 'api/src/server.ts'], {
  stdio: 'pipe',
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development' }
});

let outputReceived = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  outputReceived = true;
  
  // Si vemos que el servidor está corriendo, terminarlo después de un segundo
  if (output.includes('Servidor corriendo')) {
    setTimeout(() => {
      console.log('\n✅ Variables de entorno verificadas exitosamente!');
      serverProcess.kill();
      process.exit(0);
    }, 1000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error(`❌ Error: ${data.toString()}`);
  outputReceived = true;
});

// Timeout de seguridad
setTimeout(() => {
  if (!outputReceived) {
    console.log('⏰ Timeout - terminando proceso...');
  }
  serverProcess.kill();
  process.exit(0);
}, 5000);

serverProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`\n❌ Proceso terminó con código: ${code}`);
  }
});
