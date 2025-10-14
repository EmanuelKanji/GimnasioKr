/**
 * Test de diagnóstico específico para el QR que está fallando
 * Basado en los datos de la imagen del usuario
 */

const baseURL = 'https://gimnasiokr.onrender.com';

// Datos exactos del QR de la imagen
const qrDataExacto = {
  "rut": "134567892",
  "plan": "PM 2X", 
  "validoDesde": "2025-10-14T00:00:00.000Z",
  "validoHasta": "2025-11-14T00:00:00.000Z",
  "timestamp": 1760452114295,
  "expiraEn": 1760452714295,
  "token": "g8t4gx02intm2c4nzxs4we",
  "version": "2.0"
};

async function diagnosticarQR() {
  console.log('🔍 Diagnóstico Completo del QR');
  console.log('================================');
  
  console.log('\n📋 Datos del QR a analizar:');
  console.log(JSON.stringify(qrDataExacto, null, 2));
  
  // Test 1: Usar endpoint de diagnóstico
  console.log('\n1. Usando endpoint de diagnóstico:');
  try {
    const response = await fetch(`${baseURL}/api/asistencias/diagnosticar-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_admin_token'
      },
      body: JSON.stringify({
        qrData: JSON.stringify(qrDataExacto)
      })
    });
    
    if (response.ok) {
      const diagnostico = await response.json();
      console.log('   ✅ Diagnóstico exitoso:');
      console.log(JSON.stringify(diagnostico, null, 2));
    } else {
      console.log(`   ❌ Error en diagnóstico: ${response.status}`);
      const error = await response.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }
  
  // Test 2: Intentar registrar asistencia
  console.log('\n2. Intentando registrar asistencia:');
  try {
    const response = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_admin_token'
      },
      body: JSON.stringify({
        rut: '134567892',
        qrData: JSON.stringify(qrDataExacto)
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Asistencia registrada:', data);
    } else {
      const error = await response.json();
      console.log('   ❌ Error:', error);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }
  
  // Test 3: Solo RUT (sin QR)
  console.log('\n3. Probando solo RUT (sin QR):');
  try {
    const response = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_admin_token'
      },
      body: JSON.stringify({
        rut: '134567892'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Asistencia registrada:', data);
    } else {
      const error = await response.json();
      console.log('   ❌ Error:', error);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }
  
  // Test 4: Análisis de timestamps
  console.log('\n4. Análisis de timestamps:');
  const ahora = Date.now();
  const timestampQR = qrDataExacto.timestamp;
  const expiraEnQR = qrDataExacto.expiraEn;
  
  console.log(`   Timestamp actual: ${ahora} (${new Date(ahora).toISOString()})`);
  console.log(`   Timestamp QR: ${timestampQR} (${new Date(timestampQR).toISOString()})`);
  console.log(`   Expira en QR: ${expiraEnQR} (${new Date(expiraEnQR).toISOString()})`);
  console.log(`   Diferencia timestamp: ${ahora - timestampQR} ms`);
  console.log(`   Diferencia expira: ${ahora - expiraEnQR} ms`);
  console.log(`   Es futuro: ${timestampQR > ahora}`);
  console.log(`   Ha expirado: ${ahora > expiraEnQR}`);
  
  console.log('\n================================');
  console.log('Diagnóstico completado');
}

// Ejecutar diagnóstico
diagnosticarQR().catch(console.error);
