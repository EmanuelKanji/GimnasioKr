/**
 * Script para verificar y limpiar asistencias del día actual
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Alumno = require('./dist/models/Alumno').default;
const Asistencia = require('./dist/models/Asistencia').default;

async function verificarAsistenciasHoy() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gimnasio');
    console.log('✅ Conectado a la base de datos');

    // Obtener fecha de hoy
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fechaHoy = `${yyyy}-${mm}-${dd}`;

    console.log(`\n📅 Verificando asistencias para: ${fechaHoy}`);

    // Buscar alumno específico
    const alumno = await Alumno.findOne({ rut: '134567892' });
    if (!alumno) {
      console.log('❌ Alumno 134567892 no encontrado');
      return;
    }

    console.log(`\n👤 Alumno encontrado: ${alumno.nombre}`);
    console.log(`   RUT: ${alumno.rut}`);
    console.log(`   Plan: ${alumno.plan}`);
    console.log(`   Asistencias totales: ${alumno.asistencias.length}`);
    console.log(`   Asistencias: ${alumno.asistencias}`);

    // Verificar si tiene asistencia hoy
    const tieneAsistenciaHoy = alumno.asistencias.includes(fechaHoy);
    console.log(`\n📊 ¿Tiene asistencia hoy? ${tieneAsistenciaHoy}`);

    if (tieneAsistenciaHoy) {
      console.log('\n🧹 Limpiando asistencia de hoy...');
      
      // Remover asistencia de hoy
      alumno.asistencias = alumno.asistencias.filter(fecha => fecha !== fechaHoy);
      await alumno.save();
      
      console.log('✅ Asistencia de hoy removida');
      console.log(`   Nuevas asistencias: ${alumno.asistencias.length}`);
    }

    // Buscar asistencias en la colección Asistencia
    const asistenciasHoy = await Asistencia.find({
      fecha: {
        $gte: new Date(`${fechaHoy}T00:00:00.000Z`),
        $lt: new Date(`${fechaHoy}T23:59:59.999Z`)
      }
    });

    console.log(`\n📋 Asistencias en colección Asistencia para hoy: ${asistenciasHoy.length}`);
    asistenciasHoy.forEach(asist => {
      console.log(`   - RUT: ${asist.rut}, Fecha: ${asist.fecha}`);
    });

    if (asistenciasHoy.length > 0) {
      console.log('\n🧹 Limpiando asistencias de la colección...');
      await Asistencia.deleteMany({
        fecha: {
          $gte: new Date(`${fechaHoy}T00:00:00.000Z`),
          $lt: new Date(`${fechaHoy}T23:59:59.999Z`)
        }
      });
      console.log('✅ Asistencias de hoy removidas de la colección');
    }

    console.log('\n🎉 Verificación completada');
    console.log('Ahora puedes probar el QR nuevamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}

verificarAsistenciasHoy();
