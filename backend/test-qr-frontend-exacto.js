/**
 * Test exacto del QR que está enviando el frontend
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Simular exactamente lo que está enviando el frontend
const qrDataExacto = '{"rut":"134567892","plan":"PM 2X","validoDesde":"2025-10-14T00:00:00.000Z","validoHasta":"2025-11-14T00:00:00.000Z","timestamp":1760454456716,"expiraEn":1760454756716,"token":"t8tujx07r8zins2inykhd","version":"2.0"}';

async function testQRFrontendExacto() {
  console.log('🔍 Test QR Frontend Exacto');
  console.log('==========================');
  
  console.log('📱 QR Data:', qrDataExacto);
  console.log('📏 Longitud:', qrDataExacto.length);
  
  // Verificar que se puede parsear
  try {
    const parsed = JSON.parse(qrDataExacto);
    console.log('✅ JSON válido - se puede parsear');
    console.log('📋 Campos:', Object.keys(parsed));
  } catch (e) {
    console.log('❌ Error parseando JSON:', e.message);
    return;
  }
  
  // Crear un token de prueba (simulando lo que haría el frontend)
  const tokenPrueba = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzQ5YjQ5YzQ5YzQ5YzQ5YzQ5YzQ5YzQiLCJlbWFpbCI6ImFkbWluQGdpbW5hc2lvLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDQ1NDAwMCwiZXhwIjoxNzYwNTQxNDAwfQ.fake_signature';
  
  try {
    console.log('\n📤 Enviando QR con token de prueba...');
    const qrResponse = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenPrueba}`
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
  
  console.log('\n==========================');
  console.log('Test completado');
}

testQRFrontendExacto().catch(console.error);
