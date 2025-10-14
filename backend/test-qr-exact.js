/**
 * Test exacto del QR que está enviando el frontend
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Simular exactamente el QR que está enviando el frontend
const qrDataExacto = '{"rut":"134567892","plan":"PM 2X","validoDesde":"2025-10-14T00:00:00.000Z","validoHasta":"2025-11-14T00:00:00.000Z","timestamp":1760454456716,"expiraEn":1760454756716,"token":"t8tujx07r8zins2inykhd","version":"2.0"}';

async function testQRExacto() {
  console.log('🔍 Test QR Exacto - Simulando Frontend');
  console.log('=====================================');
  
  console.log('📱 QR Data exacto:', qrDataExacto);
  console.log('📏 Longitud:', qrDataExacto.length);
  
  // Verificar que se puede parsear
  try {
    const parsed = JSON.parse(qrDataExacto);
    console.log('✅ JSON válido - se puede parsear');
    console.log('📋 Campos:', Object.keys(parsed));
    console.log('🔢 Timestamp:', parsed.timestamp, typeof parsed.timestamp);
    console.log('🔢 ExpiraEn:', parsed.expiraEn, typeof parsed.expiraEn);
  } catch (e) {
    console.log('❌ Error parseando JSON:', e.message);
    return;
  }
  
  // Test con autenticación real
  try {
    console.log('\n1. 🔐 Obteniendo token...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin@gimnasio.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Error en login:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
    
    console.log('\n2. 📤 Enviando QR exacto...');
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
    console.log('📋 Respuesta:', qrResult);
    
    if (qrResult.debug) {
      console.log('🔍 Debug info:', qrResult.debug);
    }
    
  } catch (error) {
    console.log('❌ Error en test:', error.message);
  }
  
  console.log('\n=====================================');
  console.log('Test completado');
}

testQRExacto().catch(console.error);
