/**
 * Test de roles para avisos
 */

// Simular diferentes tokens con diferentes roles
const tokens = {
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGY5YjQ5YjQ5YjQ5YjQ5IiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczOTU2ODAwMCwiZXhwIjoxNzM5NjU0NDAwfQ.fake_admin_token',
  profesor: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGY5YjQ5YjQ5YjQ5YjQ5IiwidXNlcm5hbWUiOiJwcm9mZXNvciIsInJvbGUiOiJwcm9mZXNvciIsImlhdCI6MTczOTU2ODAwMCwiZXhwIjoxNzM5NjU0NDAwfQ.fake_profesor_token',
  alumno: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGY5YjQ5YjQ5YjQ5YjQ5IiwidXNlcm5hbWUiOiJhbHVtbm8iLCJyb2xlIjoiYWx1bW5vIiwiaWF0IjoxNzM5NTY4MDAwLCJleHAiOjE3Mzk2NTQ0MDB9.fake_alumno_token'
};

const baseURL = 'http://localhost:3000';

async function testAvisosRoles() {
  console.log('🧪 Test de Roles para Avisos');
  console.log('============================');

  const testData = {
    titulo: 'Test de Aviso',
    mensaje: 'Este es un aviso de prueba',
    destinatarios: ['1234567899'],
    tipo: 'manual'
  };

  // Test 1: Admin enviando aviso
  console.log('\n1. Test Admin enviando aviso:');
  try {
    const response = await fetch(`${baseURL}/api/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.admin}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      console.log('   ✅ Admin puede enviar avisos');
    } else {
      const error = await response.json();
      console.log(`   ❌ Error: ${error.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  // Test 2: Profesor enviando aviso
  console.log('\n2. Test Profesor enviando aviso:');
  try {
    const response = await fetch(`${baseURL}/api/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.profesor}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      console.log('   ✅ Profesor puede enviar avisos');
    } else {
      const error = await response.json();
      console.log(`   ❌ Error: ${error.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  // Test 3: Alumno enviando aviso (debería fallar)
  console.log('\n3. Test Alumno enviando aviso (debería fallar):');
  try {
    const response = await fetch(`${baseURL}/api/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.alumno}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      console.log('   ⚠️ Alumno puede enviar avisos (no debería)');
    } else {
      const error = await response.json();
      console.log(`   ✅ Correcto: ${error.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  // Test 4: Sin token (debería fallar)
  console.log('\n4. Test sin token (debería fallar):');
  try {
    const response = await fetch(`${baseURL}/api/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    
    if (response.ok) {
      console.log('   ⚠️ Sin token puede enviar avisos (no debería)');
    } else {
      const error = await response.json();
      console.log(`   ✅ Correcto: ${error.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  console.log('\n============================');
  console.log('Test completado');
}

// Ejecutar test
testAvisosRoles().catch(console.error);
