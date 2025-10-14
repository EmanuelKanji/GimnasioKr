/**
 * Test final para verificar la sincronización QR-Backend
 */

// Simular datos del perfil del alumno (pueden estar expirados)
const perfilAlumno = {
  rut: '1234567899',
  plan: 'PM 3X',
  fechaInicioPlan: '2024-10-01T00:00:00.000Z', // Fecha expirada
  fechaTerminoPlan: '2024-12-31T00:00:00.000Z' // Fecha expirada
};

// Simular función limpiarRut
const limpiarRut = (rut) => rut.replace(/\.|-/g, '').toUpperCase();

// Simular lógica del frontend (QrAlumno.tsx)
function generarQRFrontend(rut, plan, fechaInicio, fechaFin) {
  const ahora = Date.now();
  const tiempoExpiracion = 10 * 60 * 1000; // 10 minutos
  const expiraEn = ahora + tiempoExpiracion;
  
  // Validar fechas antes de generar QR
  const fechaInicioPlan = new Date(fechaInicio);
  const fechaFinPlan = new Date(fechaFin);
  const fechaActual = new Date();
  
  // Si las fechas del perfil están expiradas, usar fechas actuales para el QR
  let validoDesde, validoHasta;
  
  if (isNaN(fechaInicioPlan.getTime()) || isNaN(fechaFinPlan.getTime())) {
    // Fechas inválidas, usar fechas por defecto
    validoDesde = fechaActual.toISOString();
    validoHasta = new Date(fechaActual.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
  } else if (fechaActual > fechaFinPlan) {
    // Plan expirado según perfil, usar fechas actuales para QR
    validoDesde = fechaActual.toISOString();
    validoHasta = new Date(fechaActual.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
  } else {
    // Fechas válidas, usar las del perfil
    validoDesde = fechaInicioPlan.toISOString();
    validoHasta = fechaFinPlan.toISOString();
  }
  
  return {
    rut: limpiarRut(rut),
    plan,
    validoDesde,
    validoHasta,
    timestamp: ahora,
    expiraEn: expiraEn,
    token: Math.random().toString(36).substring(2, 15),
    version: '2.0'
  };
}

// Simular validaciones del backend
function validarBackend(alumno, qrData) {
  const ahora = Date.now();
  const fechaActual = new Date();
  
  // 1. Validar fechas del perfil del alumno (PRINCIPAL)
  const fechaInicioPlan = new Date(alumno.fechaInicioPlan);
  const fechaFinPlan = new Date(alumno.fechaTerminoPlan);
  
  if (fechaActual > fechaFinPlan) {
    return { valido: false, error: 'PLAN_EXPIRADO', mensaje: 'El plan del alumno ha expirado' };
  }
  
  // 2. Validar QR (SECUNDARIO)
  if (qrData) {
    const datosQR = JSON.parse(qrData);
    
    // Validar expiración del QR
    if (datosQR.expiraEn && ahora > datosQR.expiraEn) {
      return { valido: false, error: 'QR_EXPIRADO', mensaje: 'El QR ha expirado' };
    }
    
    // Validar timestamp del QR
    if (datosQR.timestamp && (ahora - datosQR.timestamp) > (10 * 60 * 1000)) {
      return { valido: false, error: 'QR_ANTIGUO', mensaje: 'El QR es demasiado antiguo' };
    }
    
    // Validar RUT
    const rutQRLimpio = limpiarRut(datosQR.rut);
    const rutAlumnoLimpio = limpiarRut(alumno.rut);
    
    if (rutQRLimpio !== rutAlumnoLimpio) {
      return { valido: false, error: 'RUT_NO_COINCIDE', mensaje: 'El RUT del QR no coincide' };
    }
  }
  
  return { valido: true, mensaje: 'Todas las validaciones pasaron' };
}

console.log('🧪 Test Final QR-Backend Sincronización');
console.log('=====================================');

console.log('\n1. Perfil del Alumno:');
console.log(JSON.stringify(perfilAlumno, null, 2));

console.log('\n2. Generando QR con lógica del frontend:');
const qrGenerado = generarQRFrontend(
  perfilAlumno.rut,
  perfilAlumno.plan,
  perfilAlumno.fechaInicioPlan,
  perfilAlumno.fechaTerminoPlan
);
console.log(JSON.stringify(qrGenerado, null, 2));

console.log('\n3. Validando con lógica del backend:');
const validacion = validarBackend(perfilAlumno, JSON.stringify(qrGenerado));
console.log(validacion);

console.log('\n4. Análisis:');
console.log(`- Fecha actual: ${new Date().toISOString()}`);
console.log(`- Fecha fin plan: ${new Date(perfilAlumno.fechaTerminoPlan).toISOString()}`);
console.log(`- Plan expirado: ${new Date() > new Date(perfilAlumno.fechaTerminoPlan)}`);
console.log(`- QR validoDesde: ${qrGenerado.validoDesde}`);
console.log(`- QR validoHasta: ${qrGenerado.validoHasta}`);
console.log(`- QR expiraEn: ${new Date(qrGenerado.expiraEn).toISOString()}`);

if (validacion.valido) {
  console.log('\n✅ ÉXITO: El QR ahora funciona correctamente con el backend');
} else {
  console.log(`\n❌ ERROR: ${validacion.mensaje}`);
}

console.log('\n=====================================');
console.log('Test completado');
