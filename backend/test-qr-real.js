/**
 * Test real del QR para identificar el error específico
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Simular exactamente lo que genera el frontend
function generarQRComoFrontend() {
  const ahora = Date.now();
  const tiempoExpiracion = 5 * 60 * 1000; // 5 minutos
  const expiraEn = ahora + tiempoExpiracion;
  
  // Fechas como las genera el frontend
  const fechaActual = new Date();
  const validoDesde = fechaActual.toISOString();
  const validoHasta = new Date(fechaActual.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
  
  const datosQR = {
    rut: "134567892",
    plan: "PM 2X",
    validoDesde: validoDesde,
    validoHasta: validoHasta,
    timestamp: ahora,
    expiraEn: expiraEn,
    token: "debug_token_" + Math.random().toString(36).substring(2, 15),
    version: "2.0"
  };
  
  return JSON.stringify(datosQR);
}

async function testQRReal() {
  console.log('🔍 Test QR Real - Simulando Frontend');
  console.log('=====================================');
  
  const qrData = generarQRComoFrontend();
  console.log('📱 QR generado:', qrData);
  console.log('📏 Longitud:', qrData.length);
  
  // Test con token real (necesitamos obtener uno)
  console.log('\n1. 🧪 Probando con autenticación...');
  
  try {
    // Primero intentar login para obtener token
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gimnasio.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
      
      // Ahora probar el QR con token válido
      const qrResponse = await fetch(`${baseURL}/api/asistencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rut: '134567892',
          qrData: qrData
        })
      });
      
      console.log(`\n📊 Status QR: ${qrResponse.status}`);
      const qrResult = await qrResponse.json();
      console.log('📋 Respuesta QR:', qrResult);
      
      if (qrResult.debug) {
        console.log('🔍 Debug info:', qrResult.debug);
      }
      
    } else {
      console.log('❌ Error en login:', await loginResponse.text());
    }
    
  } catch (error) {
    console.log('❌ Error en test:', error.message);
  }
  
  // Test 2: Solo RUT (debería funcionar)
  console.log('\n2. 🧪 Probando solo RUT...');
  
  try {
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gimnasio.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      const rutResponse = await fetch(`${baseURL}/api/asistencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rut: '134567892'
        })
      });
      
      console.log(`📊 Status RUT: ${rutResponse.status}`);
      const rutResult = await rutResponse.json();
      console.log('📋 Respuesta RUT:', rutResult);
      
    } else {
      console.log('❌ Error en login para RUT:', await loginResponse.text());
    }
    
  } catch (error) {
    console.log('❌ Error en test RUT:', error.message);
  }
  
  console.log('\n=====================================');
  console.log('Test completado');
}

testQRReal().catch(console.error);
