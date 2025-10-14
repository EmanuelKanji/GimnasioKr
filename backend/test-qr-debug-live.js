/**
 * Test para debuggear el QR en vivo con logs detallados
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Crear un QR nuevo con timestamp actual
const ahora = Date.now();
const qrDataNuevo = {
  "rut": "134567892",
  "plan": "PM 2X", 
  "validoDesde": "2025-10-14T00:00:00.000Z",
  "validoHasta": "2025-11-14T00:00:00.000Z",
  "timestamp": ahora,
  "expiraEn": ahora + (5 * 60 * 1000), // 5 minutos
  "token": "debug_token_" + Math.random().toString(36).substring(2, 15),
  "version": "2.0"
};

async function debugQR() {
  console.log('🔍 Debug QR en VIVO');
  console.log('===================');
  
  console.log('\n📋 QR a enviar:');
  console.log(JSON.stringify(qrDataNuevo, null, 2));
  console.log(`\n📏 Longitud del JSON: ${JSON.stringify(qrDataNuevo).length} caracteres`);
  
  // Test 1: Solo RUT (debería funcionar)
  console.log('\n1. 🧪 Probando solo RUT:');
  try {
    const response1 = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_token' // Token falso para ver el error específico
      },
      body: JSON.stringify({
        rut: '134567892'
      })
    });
    
    console.log(`   Status: ${response1.status}`);
    const result1 = await response1.json();
    console.log('   Respuesta:', result1);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 2: QR completo (debería fallar con error específico)
  console.log('\n2. 🧪 Probando QR completo:');
  try {
    const response2 = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_token' // Token falso para ver el error específico
      },
      body: JSON.stringify({
        rut: '134567892',
        qrData: JSON.stringify(qrDataNuevo)
      })
    });
    
    console.log(`   Status: ${response2.status}`);
    const result2 = await response2.json();
    console.log('   Respuesta:', result2);
    
    // Si hay debug info, mostrarla
    if (result2.debug) {
      console.log('   Debug info:', result2.debug);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 3: Análisis del JSON del QR
  console.log('\n3. 🔍 Análisis del JSON del QR:');
  const qrString = JSON.stringify(qrDataNuevo);
  console.log(`   String length: ${qrString.length}`);
  console.log(`   First 100 chars: ${qrString.substring(0, 100)}...`);
  console.log(`   Last 100 chars: ...${qrString.substring(qrString.length - 100)}`);
  
  // Verificar si se puede parsear
  try {
    const parsed = JSON.parse(qrString);
    console.log('   ✅ JSON válido - se puede parsear');
    console.log(`   Campos: ${Object.keys(parsed).join(', ')}`);
  } catch (e) {
    console.log('   ❌ JSON inválido:', e.message);
  }
  
  // Test 4: Simular exactamente lo que hace el frontend
  console.log('\n4. 🎯 Simulando envío del frontend:');
  const requestData = {
    rut: '134567892',
    qrData: qrString
  };
  
  console.log('   Request data:', {
    rut: requestData.rut,
    qrDataLength: requestData.qrData.length,
    qrDataPreview: requestData.qrData.substring(0, 50) + '...'
  });
  
  try {
    const response4 = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_token'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log(`   Status: ${response4.status}`);
    const result4 = await response4.json();
    console.log('   Respuesta:', result4);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n===================');
  console.log('Debug completado');
}

debugQR().catch(console.error);
