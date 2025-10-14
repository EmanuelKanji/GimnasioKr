/**
 * Test QR sin autenticación para ver el error específico
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Simular exactamente el QR que está enviando el frontend
const qrDataExacto = '{"rut":"134567892","plan":"PM 2X","validoDesde":"2025-10-14T00:00:00.000Z","validoHasta":"2025-11-14T00:00:00.000Z","timestamp":1760454456716,"expiraEn":1760454756716,"token":"t8tujx07r8zins2inykhd","version":"2.0"}';

async function testQRSinAuth() {
  console.log('🔍 Test QR Sin Autenticación');
  console.log('============================');
  
  console.log('📱 QR Data:', qrDataExacto);
  
  try {
    console.log('\n📤 Enviando QR sin autenticación...');
    const qrResponse = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    console.log('❌ Error en test:', error.message);
  }
  
  console.log('\n============================');
  console.log('Test completado');
}

testQRSinAuth().catch(console.error);
