#!/usr/bin/env node

/**
 * Script para probar la configuración de CORS del backend
 * Uso: node test-cors.js
 */

const https = require('https');

const BACKEND_URL = 'https://gimnasiokr.onrender.com';
const FRONTEND_ORIGIN = 'https://kraccess.netlify.app';

console.log('🔧 Probando configuración CORS...\n');

// Función para hacer petición HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Prueba 1: Petición OPTIONS (Preflight)
async function testPreflight() {
  console.log('1️⃣ Probando petición OPTIONS (Preflight)...');
  
  const options = {
    hostname: 'gimnasiokr.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'OPTIONS',
    headers: {
      'Origin': FRONTEND_ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NO ENCONTRADO'}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'NO ENCONTRADO'}`);
    console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'NO ENCONTRADO'}`);
    console.log(`   Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'NO ENCONTRADO'}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Preflight OK\n');
      return true;
    } else {
      console.log('   ❌ Preflight FALLÓ\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

// Prueba 2: Petición GET básica
async function testBasicRequest() {
  console.log('2️⃣ Probando petición GET básica...');
  
  const options = {
    hostname: 'gimnasiokr.onrender.com',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
      'Origin': FRONTEND_ORIGIN
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NO ENCONTRADO'}`);
    console.log(`   Response: ${response.data.substring(0, 100)}...`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ GET básico OK\n');
      return true;
    } else {
      console.log('   ❌ GET básico FALLÓ\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

// Prueba 3: Petición POST de login
async function testLoginRequest() {
  console.log('3️⃣ Probando petición POST de login...');
  
  const loginData = JSON.stringify({
    username: 'test',
    password: 'test'
  });
  
  const options = {
    hostname: 'gimnasiokr.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData),
      'Origin': FRONTEND_ORIGIN
    }
  };
  
  try {
    const response = await makeRequest(options, loginData);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NO ENCONTRADO'}`);
    console.log(`   Response: ${response.data.substring(0, 200)}...`);
    
    if (response.statusCode === 200 || response.statusCode === 401) {
      console.log('   ✅ POST login OK (401 es esperado con credenciales de prueba)\n');
      return true;
    } else {
      console.log('   ❌ POST login FALLÓ\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  console.log(`🎯 Probando CORS desde ${FRONTEND_ORIGIN} hacia ${BACKEND_URL}\n`);
  
  const results = await Promise.all([
    testPreflight(),
    testBasicRequest(),
    testLoginRequest()
  ]);
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 RESUMEN:');
  console.log(`   Pruebas pasadas: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('   🎉 ¡Todas las pruebas de CORS pasaron!');
    console.log('   ✅ El backend está configurado correctamente');
  } else {
    console.log('   ⚠️  Algunas pruebas fallaron');
    console.log('   🔧 Revisar la configuración del backend');
  }
  
  console.log('\n💡 Si las pruebas fallan, verificar:');
  console.log('   1. Que el backend esté desplegado en Render');
  console.log('   2. Que los cambios de CORS estén aplicados');
  console.log('   3. Que no haya cache en el navegador');
}

// Ejecutar
runTests().catch(console.error);
