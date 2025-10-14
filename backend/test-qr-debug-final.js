/**
 * Test final de debug del QR - Simular exactamente lo que está pasando
 */

const baseURL = 'http://localhost:3000';

// Datos exactos del QR de la imagen
const qrData = {
  rut: "134567892",
  plan: "PM 2X",
  validoDesde: "2025-10-14T00:00:00.000Z",
  validoHasta: "2025-11-14T00:00:00.000Z",
  timestamp: 1760450282034,
  expiraEn: 1760450882034,
  token: "6arj3y3czzchg9fkf9sdl",
  version: "2.0"
};

async function testQRDebug() {
  console.log('🧪 Test Final de Debug del QR');
  console.log('============================');
  
  console.log('\n📋 Datos del QR a enviar:');
  console.log(JSON.stringify(qrData, null, 2));
  
  // Test 1: Verificar que el alumno existe
  console.log('\n1. Verificando si el alumno existe en la BD:');
  try {
    const response = await fetch(`${baseURL}/api/alumnos`, {
      headers: {
        'Authorization': 'Bearer fake_admin_token'
      }
    });
    
    if (response.ok) {
      const alumnos = await response.json();
      const alumno = alumnos.find(a => a.rut === '134567892');
      
      if (alumno) {
        console.log('   ✅ Alumno encontrado:', {
          nombre: alumno.nombre,
          rut: alumno.rut,
          plan: alumno.plan,
          fechaInicioPlan: alumno.fechaInicioPlan,
          fechaTerminoPlan: alumno.fechaTerminoPlan
        });
      } else {
        console.log('   ❌ Alumno NO encontrado');
        console.log('   📋 RUTs disponibles:', alumnos.map(a => a.rut).slice(0, 5));
      }
    } else {
      console.log('   ❌ Error obteniendo alumnos:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
  }
  
  // Test 2: Enviar asistencia con QR
  console.log('\n2. Enviando asistencia con QR:');
  try {
    const response = await fetch(`${baseURL}/api/asistencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_admin_token'
      },
      body: JSON.stringify({
        rut: '134567892',
        qrData: JSON.stringify(qrData)
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
    console.log('   ❌ Error de conexión:', error.message);
  }
  
  // Test 3: Enviar solo RUT (sin QR)
  console.log('\n3. Enviando solo RUT (sin QR):');
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
    console.log('   ❌ Error de conexión:', error.message);
  }
  
  console.log('\n============================');
  console.log('Test completado');
}

// Ejecutar test
testQRDebug().catch(console.error);
