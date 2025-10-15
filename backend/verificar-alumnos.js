const mongoose = require('mongoose');
const Alumno = require('./dist/models/Alumno').default;

async function verificarAlumnos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gimnasio');
    console.log('✅ Conectado a MongoDB');

    const alumnos = await Alumno.find({});
    console.log(`📊 Total de alumnos: ${alumnos.length}`);
    
    alumnos.forEach((alumno, index) => {
      console.log(`${index + 1}. ${alumno.nombre} (${alumno.rut}) - Asistencias: ${alumno.asistencias.length}`);
    });

    // Agregar algunas asistencias de prueba a un alumno
    if (alumnos.length > 0) {
      const alumno = alumnos[0];
      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      const anteayer = new Date(hoy);
      anteayer.setDate(hoy.getDate() - 2);

      alumno.asistencias = [
        hoy.toISOString().split('T')[0],
        ayer.toISOString().split('T')[0],
        anteayer.toISOString().split('T')[0]
      ];

      await alumno.save();
      console.log(`✅ Agregadas ${alumno.asistencias.length} asistencias de prueba a ${alumno.nombre}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

verificarAlumnos();
