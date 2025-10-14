/**
 * Test QR con token válido
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Simular exactamente el QR que está enviando el frontend
const qrDataExacto = '{"rut":"134567892","plan":"PM 2X","validoDesde":"2025-10-14T00:00:00.000Z","validoHasta":"2025-11-14T00:00:00.000Z","timestamp":1760454456716,"expiraEn":1760454756716,"token":"t8tujx07r8zins2inykhd","version":"2.0"}';

async function testQRConToken() {
  console.log('🔍 Test QR Con Token Válido');
  console.log('===========================');
  
  // Intentar diferentes credenciales de login
  const credenciales = [
    { username: 'admin@gimnasio.com', password: 'admin123' },
    { username: 'admin', password: 'admin123' },
    { username: 'admin@gimnasio.com', password: 'admin' },
    { username: 'admin', password: 'admin' }
  ];
  
  let token = null;
  
  for (const cred of credenciales) {
    try {
      console.log(`\n🔐 Probando login con: ${cred.username}`);
      const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cred)
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.token;
        console.log('✅ Login exitoso!');
        console.log('🔑 Token:', token.substring(0, 30) + '...');
        break;
      } else {
        const error = await loginResponse.text();
        console.log('❌ Login falló:', error);
      }
    } catch (error) {
      console.log('❌ Error en login:', error.message);
    }
  }
  
  if (!token) {
    console.log('❌ No se pudo obtener token válido');
    return;
  }
  
  // Ahora probar el QR con el token válido
  try {
    console.log('\n📤 Enviando QR con token válido...');
    const qrResponse = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rut: '134567892',
        qrData: qrDataExacto
      })
    });
    
    console.log(`📊 Status: ${qrResponse.status}`);
    const qrResult = await qrResponse.json();
    console.log('📋 Respuesta completa:', JSON.stringify(qrResult, null, 2));
    
    if (qrResult.debug) {
      console.log('🔍 Debug info:', qrResult.debug);
    }
    
  } catch (error) {
    console.log('❌ Error en test QR:', error.message);
  }
  
  console.log('\n===========================');
  console.log('Test completado');
}

testQRConToken().catch(console.error);
