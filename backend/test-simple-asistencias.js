const mongoose = require('mongoose');
const Alumno = require('./dist/models/Alumno').default;

async function testSimpleAsistencias() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gimnasio');
    console.log('✅ Conectado a MongoDB');

    // Buscar todos los alumnos
    const alumnos = await Alumno.find({});
    console.log(`📊 Total de alumnos: ${alumnos.length}`);
    
    if (alumnos.length === 0) {
      console.log('❌ No hay alumnos en la base de datos');
      return;
    }

    // Mostrar información de cada alumno
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      console.log(`\n👤 Alumno ${i + 1}: ${alumno.nombre} (${alumno.rut})`);
      console.log(`   - Asistencias: ${alumno.asistencias.length}`);
      console.log(`   - Límite clases: ${alumno.limiteClases}`);
      console.log(`   - Plan: ${alumno.plan}`);
      console.log(`   - Fecha inicio plan: ${alumno.fechaInicioPlan}`);
      
      if (alumno.asistencias.length > 0) {
        console.log(`   - Primeras asistencias: ${alumno.asistencias.slice(0, 3).join(', ')}`);
      }
    }

    // Probar el filtrado con el primer alumno que tenga asistencias
    const alumnoConAsistencias = alumnos.find(a => a.asistencias.length > 0);
    
    if (alumnoConAsistencias) {
      console.log(`\n🔍 Probando filtrado con: ${alumnoConAsistencias.nombre}`);
      
      const { AttendanceService } = require('./dist/services/attendanceService');
      
      const periodoActual = AttendanceService.obtenerMesActualDelPlan(
        alumnoConAsistencias.fechaInicioPlan,
        new Date()
      );

      console.log('📅 Período actual del plan:', {
        inicio: periodoActual.inicio.toISOString(),
        fin: periodoActual.fin.toISOString(),
        numeroMes: periodoActual.numeroMes
      });

      // Aplicar el nuevo filtrado
      let asistenciasMesActual = alumnoConAsistencias.asistencias.filter(fecha => {
        const fechaAsistencia = new Date(fecha + 'T00:00:00');
        return fechaAsistencia >= periodoActual.inicio && fechaAsistencia <= periodoActual.fin;
      });

      // Fallback a mes calendario
      if (asistenciasMesActual.length === 0) {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        
        asistenciasMesActual = alumnoConAsistencias.asistencias.filter(fecha => {
          const fechaAsistencia = new Date(fecha + 'T00:00:00');
          return fechaAsistencia.getMonth() === mesActual && fechaAsistencia.getFullYear() === añoActual;
        });
      }

      // Fallback a todas las asistencias
      if (asistenciasMesActual.length === 0 && alumnoConAsistencias.asistencias.length > 0) {
        console.log('⚠️ No se encontraron asistencias en filtros, mostrando todas');
        asistenciasMesActual = [...alumnoConAsistencias.asistencias];
      }

      console.log('🔍 Resultado del filtrado:', {
        asistenciasTotales: alumnoConAsistencias.asistencias.length,
        asistenciasFiltradas: asistenciasMesActual.length,
        asistenciasFiltradasEjemplo: asistenciasMesActual.slice(0, 3)
      });

      // Calcular límite de clases
      let limiteClases = 0;
      if (alumnoConAsistencias.limiteClases === '12') {
        limiteClases = 12;
      } else if (alumnoConAsistencias.limiteClases === '8') {
        limiteClases = 8;
      } else if (alumnoConAsistencias.limiteClases === 'todos_los_dias') {
        const diasHabilesMes = AttendanceService.calcularDiasHabiles(periodoActual.inicio, periodoActual.fin);
        limiteClases = AttendanceService.aplicarProtocoloGimnasio(999, diasHabilesMes);
      } else {
        console.log('⚠️ Límite de clases no definido, usando fallback');
        const diasHabilesMes = AttendanceService.calcularDiasHabiles(periodoActual.inicio, periodoActual.fin);
        limiteClases = AttendanceService.aplicarProtocoloGimnasio(999, diasHabilesMes);
      }

      const totalAsistencias = asistenciasMesActual.length;
      const asistenciasRestantes = Math.max(0, limiteClases - totalAsistencias);

      console.log('📊 Resultado final:', {
        limiteClases,
        totalAsistencias,
        asistenciasRestantes
      });
    } else {
      console.log('❌ No hay alumnos con asistencias para probar');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

testSimpleAsistencias();
