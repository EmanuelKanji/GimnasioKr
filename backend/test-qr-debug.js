/**
 * Script de debug para el problema del QR
 * Verifica el flujo completo desde la generación hasta la validación
 */

// Simular datos del QR
const ahora = Date.now();
const tiempoExpiracion = 10 * 60 * 1000; // 10 minutos
const expiraEn = ahora + tiempoExpiracion;

const datosQR = {
  rut: '1234567899',
  plan: 'PM 3X',
  validoDesde: new Date('2025-10-01').toISOString(),
  validoHasta: new Date('2025-12-31').toISOString(),
  timestamp: ahora,
  expiraEn: expiraEn,
  token: Math.random().toString(36).substring(2, 15),
  version: '2.0'
};

console.log('🔍 QR Debug Test');
console.log('================');

console.log('\n1. Datos del QR generados:');
console.log(JSON.stringify(datosQR, null, 2));

// Simular función limpiarRut del backend
const limpiarRut = (rut) => rut.replace(/\.|-/g, '').toUpperCase();

console.log('\n2. Test de limpieza de RUT:');
const rutOriginal = '1234567899';
const rutLimpio = limpiarRut(rutOriginal);
console.log(`RUT original: ${rutOriginal}`);
console.log(`RUT limpio: ${rutLimpio}`);

console.log('\n3. Test de validación de fechas:');
const fechaValidoHasta = new Date(datosQR.validoHasta);
const fechaActual = new Date();
console.log(`Fecha válido hasta: ${fechaValidoHasta.toISOString()}`);
console.log(`Fecha actual: ${fechaActual.toISOString()}`);
console.log(`Es válida: ${!isNaN(fechaValidoHasta.getTime())}`);
console.log(`Es futura: ${fechaActual < fechaValidoHasta}`);

console.log('\n4. Test de validación de timestamp:');
console.log(`Timestamp QR: ${datosQR.timestamp}`);
console.log(`Timestamp actual: ${ahora}`);
console.log(`Diferencia (ms): ${ahora - datosQR.timestamp}`);
console.log(`Diferencia (min): ${(ahora - datosQR.timestamp) / (1000 * 60)}`);
console.log(`Es válido (< 10 min): ${(ahora - datosQR.timestamp) < (10 * 60 * 1000)}`);

console.log('\n5. Test de validación de expiración:');
console.log(`Expira en: ${datosQR.expiraEn}`);
console.log(`Tiempo actual: ${ahora}`);
console.log(`Ha expirado: ${ahora > datosQR.expiraEn}`);

console.log('\n6. Test de comparación de RUTs:');
const rutEnviado = '1234567899';
const rutQROriginal = datosQR.rut;
const rutEnviadoLimpio = limpiarRut(rutEnviado);
const rutQRLimpio = limpiarRut(rutQROriginal);

console.log(`RUT enviado: ${rutEnviado}`);
console.log(`RUT QR original: ${rutQROriginal}`);
console.log(`RUT enviado limpio: ${rutEnviadoLimpio}`);
console.log(`RUT QR limpio: ${rutQRLimpio}`);
console.log(`Coinciden: ${rutEnviadoLimpio === rutQRLimpio}`);

console.log('\n7. Test de parseo de JSON:');
try {
  const qrString = JSON.stringify(datosQR);
  const parsedQR = JSON.parse(qrString);
  console.log('✅ JSON válido');
  console.log('Datos parseados:', parsedQR);
} catch (error) {
  console.log('❌ Error parseando JSON:', error.message);
}

console.log('\n8. Test de validación completa:');
let errores = [];

// Validar expiración
if (datosQR.expiraEn && ahora > datosQR.expiraEn) {
  errores.push('QR expirado');
}

// Validar timestamp (máximo 10 minutos)
if (datosQR.timestamp && (ahora - datosQR.timestamp) > (10 * 60 * 1000)) {
  errores.push('QR demasiado antiguo');
}

// Validar fechas
if (datosQR.validoHasta) {
  const fechaValidoHasta = new Date(datosQR.validoHasta);
  if (isNaN(fechaValidoHasta.getTime())) {
    errores.push('Fecha inválida en QR');
  } else if (ahora > fechaValidoHasta.getTime()) {
    errores.push('Plan expirado según QR');
  }
}

// Validar RUT
if (datosQR.rut) {
  const rutQRLimpio = limpiarRut(datosQR.rut);
  const rutEnviadoLimpio = limpiarRut(rutEnviado);
  
  if (rutQRLimpio !== rutEnviadoLimpio) {
    errores.push('RUT no coincide');
  }
}

if (errores.length > 0) {
  console.log('❌ Validaciones fallidas:');
  errores.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('✅ Todas las validaciones pasaron');
}

console.log('\n9. Simulación de request al backend:');
const requestData = {
  rut: rutEnviado,
  qrData: JSON.stringify(datosQR)
};

console.log('Request data:', JSON.stringify(requestData, null, 2));

console.log('\n================');
console.log('Test completado');
