// Script de prueba para verificar el rate limiting
// Este script hace múltiples requests a los endpoints protegidos para verificar que el rate limiting funciona

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testRateLimit() {
  console.log('🧪 Iniciando prueba de Rate Limiting...\n');
  
  // Datos de prueba para login
  const loginData = {
    email: 'test@example.com',
    password: 'testpassword123'
  };

  console.log('📍 Probando rate limiting en /api/users/login (límite: 5 requests por 15 minutos)');
  
  // Hacer 7 requests consecutivos para exceder el límite de 5
  for (let i = 1; i <= 7; i++) {
    try {
      console.log(`  Request ${i}...`);
      const response = await axios.post(`${API_BASE_URL}/users/login`, loginData);
      console.log(`  ✅ Request ${i}: ${response.status} - ${response.statusText}`);
      
      // Mostrar headers de rate limiting si están presentes
      if (response.headers['ratelimit-limit']) {
        console.log(`    RateLimit-Limit: ${response.headers['ratelimit-limit']}`);
        console.log(`    RateLimit-Remaining: ${response.headers['ratelimit-remaining']}`);
        console.log(`    RateLimit-Reset: ${response.headers['ratelimit-reset']}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`  🚫 Request ${i}: ${error.response.status} - Rate Limited`);
        console.log(`    Message: ${error.response.data.message || error.response.data.error}`);
        
        // Mostrar headers de rate limiting
        if (error.response.headers['ratelimit-limit']) {
          console.log(`    RateLimit-Limit: ${error.response.headers['ratelimit-limit']}`);
          console.log(`    RateLimit-Remaining: ${error.response.headers['ratelimit-remaining']}`);
          console.log(`    RateLimit-Reset: ${error.response.headers['ratelimit-reset']}`);
        }
        
        if (error.response.status === 429) {
          console.log(`  ✅ Rate limiting funcionando correctamente!`);
          break;
        }
      } else {
        console.log(`  ❌ Request ${i}: Error de conexión - ${error.message}`);
        console.log(`  💡 Asegúrate de que el servidor esté corriendo en ${API_BASE_URL}`);
        break;
      }
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📍 Probando rate limiting en /api/users/set-password (límite: 5 requests por 15 minutos)');
  
  const setPasswordData = {
    email: 'test@example.com',
    newPassword: 'newpassword123',
    token: 'fake-token-for-testing'
  };

  // Hacer 3 requests para verificar que también está protegido
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`  Request ${i}...`);
      const response = await axios.post(`${API_BASE_URL}/users/set-password`, setPasswordData);
      console.log(`  ✅ Request ${i}: ${response.status} - ${response.statusText}`);
      
    } catch (error) {
      if (error.response) {
        console.log(`  🚫 Request ${i}: ${error.response.status} - ${error.response.statusText}`);
        
        if (error.response.status === 429) {
          console.log(`  ✅ Rate limiting funcionando en set-password!`);
        } else {
          console.log(`    Message: ${error.response.data.message || error.response.data.error}`);
        }
      } else {
        console.log(`  ❌ Request ${i}: Error de conexión - ${error.message}`);
        break;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✅ Prueba de rate limiting completada!');
  console.log('💡 Si ves errores 429 (Too Many Requests), el rate limiting está funcionando correctamente.');
}

// Ejecutar la prueba
testRateLimit().catch(console.error);
