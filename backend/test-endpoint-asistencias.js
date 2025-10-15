const fetch = require('node-fetch');

async function testEndpointAsistencias() {
  try {
    // Primero necesitamos un token de autenticación
    console.log('🔐 Obteniendo token de autenticación...');
    
    const loginResponse = await fetch('https://gimnasiokr.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gimnasio.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Error en login:', loginResponse.status, loginResponse.statusText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtenido');

    // Ahora probar el endpoint de asistencias
    console.log('📊 Probando endpoint de asistencias...');
    
    const asistenciasResponse = await fetch('https://gimnasiokr.onrender.com/api/alumnos/me/asistencias-mes-actual', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📈 Status:', asistenciasResponse.status);
    
    if (asistenciasResponse.ok) {
      const asistenciasData = await asistenciasResponse.json();
      console.log('✅ Datos de asistencias recibidos:');
      console.log(JSON.stringify(asistenciasData, null, 2));
    } else {
      const errorText = await asistenciasResponse.text();
      console.error('❌ Error en asistencias:', asistenciasResponse.status, errorText);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testEndpointAsistencias();
