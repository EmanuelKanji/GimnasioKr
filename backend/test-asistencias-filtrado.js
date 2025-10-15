const mongoose = require('mongoose');
const Alumno = require('./dist/models/Alumno').default;
const Plan = require('./dist/models/Plan').default;

async function testAsistenciasFiltrado() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gimnasio');
    console.log('✅ Conectado a MongoDB');

    // Buscar un alumno con asistencias
    const alumno = await Alumno.findOne({ asistencias: { $exists: true, $not: { $size: 0 } } });
    
    if (!alumno) {
      console.log('❌ No se encontró ningún alumno con asistencias');
      return;
    }

    console.log('🔍 Alumno encontrado:', {
      rut: alumno.rut,
      nombre: alumno.nombre,
      asistencias: alumno.asistencias.length,
      limiteClases: alumno.limiteClases,
      plan: alumno.plan,
      fechaInicioPlan: alumno.fechaInicioPlan
    });

    // Simular el filtrado que hace el backend
    const { AttendanceService } = require('./dist/services/attendanceService');
    
    const periodoActual = AttendanceService.obtenerMesActualDelPlan(
      alumno.fechaInicioPlan,
      new Date()
    );

    console.log('📅 Período actual del plan:', {
      inicio: periodoActual.inicio.toISOString(),
      fin: periodoActual.fin.toISOString(),
      numeroMes: periodoActual.numeroMes
    });

    // Filtrar asistencias del mes actual del plan (comparación directa)
    let asistenciasMesActual = alumno.asistencias.filter(fecha => {
      const fechaAsistencia = new Date(fecha + 'T00:00:00'); // Asegurar formato correcto
      return fechaAsistencia >= periodoActual.inicio && fechaAsistencia <= periodoActual.fin;
    });

    // Si no hay asistencias en el período del plan, usar mes calendario como fallback
    if (asistenciasMesActual.length === 0) {
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();
      
      asistenciasMesActual = alumno.asistencias.filter(fecha => {
        const fechaAsistencia = new Date(fecha + 'T00:00:00');
        return fechaAsistencia.getMonth() === mesActual && fechaAsistencia.getFullYear() === añoActual;
      });
    }

    // Si aún no hay asistencias, mostrar todas (útil para debugging)
    if (asistenciasMesActual.length === 0 && alumno.asistencias.length > 0) {
      console.log('⚠️ No se encontraron asistencias en filtros, mostrando todas');
      asistenciasMesActual = [...alumno.asistencias];
    }

    console.log('🔍 Resultado del filtrado:', {
      asistenciasTotales: alumno.asistencias.length,
      asistenciasFiltradas: asistenciasMesActual.length,
      primerasAsistencias: alumno.asistencias.slice(0, 3),
      asistenciasFiltradasEjemplo: asistenciasMesActual.slice(0, 3)
    });

    // Calcular límite de clases
    let limiteClases = 0;
    if (alumno.limiteClases === '12') {
      limiteClases = 12;
    } else if (alumno.limiteClases === '8') {
      limiteClases = 8;
    } else if (alumno.limiteClases === 'todos_los_dias') {
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

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

testAsistenciasFiltrado();
