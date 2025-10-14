/**
 * Test del QRService para ver qué está devolviendo
 */

// Simular el QRService.processQR
function processQR(qrData) {
  // Validar que sea string no vacío
  if (!qrData || typeof qrData !== 'string' || qrData === 'undefined' || qrData.trim() === '') {
    return {
      rut: '',
      qrData: null,
      isValid: false,
      type: 'unknown',
      originalData: qrData
    };
  }

  try {
    // Intentar parsear como JSON (nuevo formato con timestamp y token)
    const datosQR = JSON.parse(qrData);
    
    // Si tiene la estructura del nuevo QR, validar campos requeridos
    if (datosQR.rut && datosQR.timestamp) {
      return {
        rut: datosQR.rut,
        qrData: qrData, // Enviar QR completo para validaciones adicionales
        isValid: true,
        type: 'new',
        originalData: qrData
      };
    }
  } catch {
    // Si no se puede parsear, buscar RUT directamente (formato legacy)
    const rutMatch = qrData.match(/(\d{1,2}\.??\d{3}\.??\d{3}-?[\dkK])/);
    if (rutMatch) {
      const rutLimpio = rutMatch[1].replace(/\.|-/g, '');
      return {
        rut: rutLimpio,
        qrData: null,
        isValid: true,
        type: 'legacy',
        originalData: qrData
      };
    }
  }

  // Si no se puede procesar de ninguna manera
  return {
    rut: '',
    qrData: null,
    isValid: false,
    type: 'unknown',
    originalData: qrData
  };
}

// Test con el QR exacto
const qrDataExacto = '{"rut":"134567892","plan":"PM 2X","validoDesde":"2025-10-14T00:00:00.000Z","validoHasta":"2025-11-14T00:00:00.000Z","timestamp":1760454456716,"expiraEn":1760454756716,"token":"t8tujx07r8zins2inykhd","version":"2.0"}';

console.log('🔍 Test QRService.processQR');
console.log('==========================');

console.log('📱 QR Input:', qrDataExacto);
console.log('📏 Longitud:', qrDataExacto.length);

const result = processQR(qrDataExacto);

console.log('\n📋 Resultado del QRService:');
console.log(JSON.stringify(result, null, 2));

console.log('\n🔍 Análisis:');
console.log('- rut:', result.rut);
console.log('- qrData:', result.qrData);
console.log('- isValid:', result.isValid);
console.log('- type:', result.type);

if (result.qrData) {
  console.log('\n📤 Lo que se enviaría al backend:');
  const requestData = {
    rut: result.rut,
    qrData: result.qrData
  };
  console.log(JSON.stringify(requestData, null, 2));
  
  console.log('\n🔍 Verificación del qrData:');
  console.log('- Tipo:', typeof result.qrData);
  console.log('- Es string:', typeof result.qrData === 'string');
  console.log('- Se puede parsear:', (() => {
    try {
      JSON.parse(result.qrData);
      return true;
    } catch {
      return false;
    }
  })());
}
