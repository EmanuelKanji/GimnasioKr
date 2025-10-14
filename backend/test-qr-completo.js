/**
 * Test completo que simula exactamente el flujo del servidor desplegado
 * Incluyendo todas las validaciones de negocio
 */

// Simular todas las validaciones del backend
function simularValidacionCompleta(rut, qrDataString) {
  console.log('🔍 Simulación COMPLETA del backend');
  console.log('===================================');
  
  try {
    // 1. Validación básica de RUT
    if (!rut) {
      return {
        error: 'RUT_REQUERIDO',
        message: 'El RUT es obligatorio.',
        codigo: 'RUT_REQUERIDO'
      };
    }
    
    console.log('✅ Paso 1: RUT presente');
    
    // 2. Limpiar RUT
    const limpiarRut = (r) => r.replace(/\.|-/g, '').toUpperCase();
    const rutLimpio = limpiarRut(rut);
    console.log(`✅ Paso 2: RUT limpio: ${rut} -> ${rutLimpio}`);
    
    // 3. Simular búsqueda de alumno (simulamos que existe)
    const alumnoSimulado = {
      nombre: 'Alumno Test',
      rut: rutLimpio,
      plan: 'PM 2X',
      fechaInicioPlan: '2025-10-01T00:00:00.000Z',
      fechaTerminoPlan: '2025-11-01T00:00:00.000Z',
      limiteClases: '8',
      asistencias: ['2025-10-14'] // Ya tiene una asistencia hoy
    };
    
    console.log('✅ Paso 3: Alumno encontrado en BD simulada');
    console.log(`   Nombre: ${alumnoSimulado.nombre}`);
    console.log(`   Plan: ${alumnoSimulado.plan}`);
    console.log(`   Fecha inicio: ${alumnoSimulado.fechaInicioPlan}`);
    console.log(`   Fecha término: ${alumnoSimulado.fechaTerminoPlan}`);
    
    // 4. Validar datos del alumno
    if (!alumnoSimulado.fechaInicioPlan || !alumnoSimulado.fechaTerminoPlan) {
      return {
        error: 'PLAN_DATOS_INCOMPLETOS',
        message: 'El alumno no tiene fechas de plan válidas.',
        codigo: 'PLAN_DATOS_INCOMPLETOS'
      };
    }
    
    console.log('✅ Paso 4: Datos del plan válidos');
    
    // 5. Validar fechas del plan
    const fechaInicioPlan = new Date(alumnoSimulado.fechaInicioPlan);
    const fechaFinPlan = new Date(alumnoSimulado.fechaTerminoPlan);
    const fechaActual = new Date();
    
    console.log('📅 Validación de fechas del plan:');
    console.log(`   Fecha actual: ${fechaActual.toISOString()}`);
    console.log(`   Fecha inicio plan: ${fechaInicioPlan.toISOString()}`);
    console.log(`   Fecha fin plan: ${fechaFinPlan.toISOString()}`);
    console.log(`   Plan activo: ${fechaActual >= fechaInicioPlan && fechaActual <= fechaFinPlan}`);
    
    if (fechaActual < fechaInicioPlan) {
      return {
        error: 'PLAN_NO_INICIADO',
        message: 'Tu plan aún no ha comenzado.',
        codigo: 'PLAN_NO_INICIADO'
      };
    }
    
    if (fechaActual > fechaFinPlan) {
      return {
        error: 'PLAN_EXPIRADO',
        message: 'Tu plan ha expirado.',
        codigo: 'PLAN_EXPIRADO'
      };
    }
    
    console.log('✅ Paso 5: Plan activo (fechas válidas)');
    
    // 6. Validar QR si está presente
    if (qrDataString) {
      console.log('🔍 Validando QR...');
      
      // Validar que sea string no vacío
      if (typeof qrDataString !== 'string' || qrDataString.trim() === '') {
        return {
          error: 'QR_VACIO',
          message: 'Datos del QR vacíos o inválidos.',
          codigo: 'QR_VACIO'
        };
      }
      
      console.log('✅ QR es string válido');
      
      // Parsear JSON
      let datosQR;
      try {
        datosQR = JSON.parse(qrDataString);
        console.log('✅ QR parseado exitosamente');
      } catch (parseError) {
        return {
          error: 'QR_FORMATO_INVALIDO',
          message: 'Formato de QR inválido.',
          codigo: 'QR_FORMATO_INVALIDO',
          parseError: parseError.message
        };
      }
      
      // Validar estructura
      if (!datosQR.rut || !datosQR.timestamp || !datosQR.expiraEn) {
        return {
          error: 'QR_ESTRUCTURA_INVALIDA',
          message: 'El QR no tiene la estructura correcta.',
          codigo: 'QR_ESTRUCTURA_INVALIDA',
          debug: {
            camposPresentes: Object.keys(datosQR),
            tieneRut: !!datosQR.rut,
            tieneTimestamp: !!datosQR.timestamp,
            tieneExpiraEn: !!datosQR.expiraEn
          }
        };
      }
      
      console.log('✅ Estructura del QR válida');
      
      // Validar timestamps
      const tiempoActual = Date.now();
      const timestampQR = datosQR.timestamp;
      const expiraEnQR = datosQR.expiraEn;
      
      console.log('⏰ Validación de timestamps:');
      console.log(`   Tiempo actual: ${tiempoActual} (${new Date(tiempoActual).toISOString()})`);
      console.log(`   Timestamp QR: ${timestampQR} (${new Date(timestampQR).toISOString()})`);
      console.log(`   Expira en QR: ${expiraEnQR} (${new Date(expiraEnQR).toISOString()})`);
      console.log(`   Ha expirado: ${tiempoActual > expiraEnQR}`);
      
      if (expiraEnQR && tiempoActual > expiraEnQR) {
        return {
          error: 'QR_EXPIRADO',
          message: 'El QR ha expirado. Por favor, genera uno nuevo.',
          codigo: 'QR_EXPIRADO'
        };
      }
      
      console.log('✅ QR no ha expirado');
      
      // Validar RUT del QR
      const rutQRLimpio = limpiarRut(datosQR.rut);
      if (rutQRLimpio !== rutLimpio) {
        return {
          error: 'RUT_NO_COINCIDE',
          message: 'El RUT del QR no coincide.',
          codigo: 'RUT_NO_COINCIDE',
          debug: {
            rutQR: datosQR.rut,
            rutEnviado: rut,
            rutQRLimpio: rutQRLimpio,
            rutEnviadoLimpio: rutLimpio
          }
        };
      }
      
      console.log('✅ RUT del QR coincide');
    }
    
    // 7. Verificar asistencia duplicada
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fechaHoy = `${yyyy}-${mm}-${dd}`;
    
    console.log(`📅 Verificando asistencia duplicada para: ${fechaHoy}`);
    console.log(`   Asistencias del alumno: ${alumnoSimulado.asistencias}`);
    console.log(`   Ya registró hoy: ${alumnoSimulado.asistencias.includes(fechaHoy)}`);
    
    if (alumnoSimulado.asistencias.includes(fechaHoy)) {
      return {
        error: 'ASISTENCIA_YA_REGISTRADA',
        message: 'Ya has registrado asistencia hoy.',
        codigo: 'ASISTENCIA_YA_REGISTRADA',
        fecha: fechaHoy
      };
    }
    
    console.log('✅ No hay asistencia duplicada');
    
    // 8. Verificar límites de clases (simulamos que no ha alcanzado el límite)
    console.log('🎯 Verificando límites de clases...');
    console.log(`   Límite del plan: ${alumnoSimulado.limiteClases}`);
    console.log(`   Asistencias del mes: ${alumnoSimulado.asistencias.length}`);
    
    // Simulamos que puede asistir
    console.log('✅ Límites de clases OK');
    
    return {
      success: true,
      message: 'Todas las validaciones pasaron - asistencia permitida',
      asistencia: {
        rut: rut,
        fecha: fechaHoy,
        hora: new Date().toLocaleTimeString('es-CL'),
        alumno: alumnoSimulado.nombre,
        plan: alumnoSimulado.plan
      }
    };
    
  } catch (error) {
    return {
      error: 'ERROR_SERVIDOR',
      message: 'Error interno del servidor',
      codigo: 'ERROR_SERVIDOR',
      details: error.message
    };
  }
}

// Test con QR expirado (el de la imagen)
console.log('🧪 TEST 1: QR EXPIRADO (de la imagen)');
console.log('=====================================');

const qrExpirado = {
  "rut": "134567892",
  "plan": "PM 2X", 
  "validoDesde": "2025-10-14T00:00:00.000Z",
  "validoHasta": "2025-11-14T00:00:00.000Z",
  "timestamp": 1760452114295,
  "expiraEn": 1760452714295,
  "token": "g8t4gx02intm2c4nzxs4we",
  "version": "2.0"
};

const resultado1 = simularValidacionCompleta('134567892', JSON.stringify(qrExpirado));
console.log('Resultado:', resultado1);

console.log('\n🧪 TEST 2: QR NUEVO');
console.log('==================');

const ahora = Date.now();
const qrNuevo = {
  "rut": "134567892",
  "plan": "PM 2X", 
  "validoDesde": "2025-10-14T00:00:00.000Z",
  "validoHasta": "2025-11-14T00:00:00.000Z",
  "timestamp": ahora,
  "expiraEn": ahora + (30 * 60 * 1000),
  "token": "nuevo_token_" + Math.random().toString(36).substring(2, 15),
  "version": "2.0"
};

const resultado2 = simularValidacionCompleta('134567892', JSON.stringify(qrNuevo));
console.log('Resultado:', resultado2);

console.log('\n🧪 TEST 3: SOLO RUT (sin QR)');
console.log('============================');

const resultado3 = simularValidacionCompleta('134567892', null);
console.log('Resultado:', resultado3);
