/**
 * Test con QR nuevo y actualizado
 */

// Crear un QR nuevo con timestamp actual
const ahora = Date.now();
const tiempoExpiracion = 30 * 60 * 1000; // 30 minutos
const expiraEn = ahora + tiempoExpiracion;

const qrDataNuevo = {
  "rut": "134567892",
  "plan": "PM 2X", 
  "validoDesde": "2025-10-14T00:00:00.000Z",
  "validoHasta": "2025-11-14T00:00:00.000Z",
  "timestamp": ahora,
  "expiraEn": expiraEn,
  "token": "nuevo_token_" + Math.random().toString(36).substring(2, 15),
  "version": "2.0"
};

function simularValidacionQR(qrDataString) {
  console.log('🔍 Simulando validación del backend con QR NUEVO');
  console.log('================================================');
  
  try {
    // 1. Validar que sea string no vacío
    if (typeof qrDataString !== 'string' || qrDataString.trim() === '') {
      return {
        error: 'QR_VACIO',
        message: 'Datos del QR vacíos o inválidos.'
      };
    }
    
    console.log('✅ Paso 1: qrData es string válido');
    console.log(`   Longitud: ${qrDataString.length} caracteres`);
    
    // 2. Intentar parsear JSON
    let datosQR;
    try {
      datosQR = JSON.parse(qrDataString);
      console.log('✅ Paso 2: JSON parseado exitosamente');
    } catch (parseError) {
      return {
        error: 'QR_FORMATO_INVALIDO',
        message: 'Formato de QR inválido.',
        parseError: parseError.message
      };
    }
    
    // 3. Validar estructura del QR
    console.log('📋 Campos presentes:', Object.keys(datosQR));
    
    if (!datosQR.rut || !datosQR.timestamp || !datosQR.expiraEn) {
      return {
        error: 'QR_ESTRUCTURA_INVALIDA',
        message: 'El QR no tiene la estructura correcta.',
        debug: {
          tieneRut: !!datosQR.rut,
          tieneTimestamp: !!datosQR.timestamp,
          tieneExpiraEn: !!datosQR.expiraEn,
          camposPresentes: Object.keys(datosQR)
        }
      };
    }
    
    console.log('✅ Paso 3: Estructura del QR válida');
    
    // 4. Validar timestamps
    const tiempoActual = Date.now();
    const timestampQR = datosQR.timestamp;
    const expiraEnQR = datosQR.expiraEn;
    
    console.log('⏰ Análisis de timestamps:');
    console.log(`   Tiempo actual: ${tiempoActual} (${new Date(tiempoActual).toISOString()})`);
    console.log(`   Timestamp QR: ${timestampQR} (${new Date(timestampQR).toISOString()})`);
    console.log(`   Expira en QR: ${expiraEnQR} (${new Date(expiraEnQR).toISOString()})`);
    console.log(`   Diferencia timestamp: ${tiempoActual - timestampQR} ms`);
    console.log(`   Diferencia expira: ${tiempoActual - expiraEnQR} ms`);
    console.log(`   Es futuro: ${timestampQR > tiempoActual}`);
    console.log(`   Ha expirado: ${tiempoActual > expiraEnQR}`);
    
    // Validar que el QR no haya expirado
    if (expiraEnQR && tiempoActual > expiraEnQR) {
      return {
        error: 'QR_EXPIRADO',
        message: 'El QR ha expirado. Por favor, genera uno nuevo.'
      };
    }
    
    console.log('✅ Paso 4: QR no ha expirado');
    
    // Validar que el QR no sea demasiado antiguo (solo si es del pasado)
    if (timestampQR && timestampQR <= tiempoActual && (tiempoActual - timestampQR) > (30 * 60 * 1000)) {
      return {
        error: 'QR_ANTIGUO',
        message: 'El QR es demasiado antiguo. Genera uno nuevo.'
      };
    }
    
    console.log('✅ Paso 5: QR no es demasiado antiguo');
    
    // 5. Validar RUT
    const limpiarRut = (rut) => rut.replace(/\.|-/g, '').toUpperCase();
    const rutQRLimpio = limpiarRut(datosQR.rut);
    const rutEnviadoLimpio = limpiarRut('134567892');
    
    console.log('🆔 Análisis de RUT:');
    console.log(`   RUT QR: ${datosQR.rut} -> ${rutQRLimpio}`);
    console.log(`   RUT enviado: 134567892 -> ${rutEnviadoLimpio}`);
    console.log(`   Coinciden: ${rutQRLimpio === rutEnviadoLimpio}`);
    
    if (rutQRLimpio !== rutEnviadoLimpio) {
      return {
        error: 'RUT_NO_COINCIDE',
        message: 'El RUT del QR no coincide.',
        debug: {
          rutQR: datosQR.rut,
          rutEnviado: '134567892',
          rutQRLimpio: rutQRLimpio,
          rutEnviadoLimpio: rutEnviadoLimpio
        }
      };
    }
    
    console.log('✅ Paso 6: RUT coincide');
    
    return {
      success: true,
      message: 'QR válido - todas las validaciones pasaron'
    };
    
  } catch (error) {
    return {
      error: 'ERROR_INESPERADO',
      message: 'Error inesperado en validación',
      details: error.message
    };
  }
}

console.log('🧪 Diagnóstico con QR NUEVO');
console.log('============================');

console.log('\n📋 Datos del QR nuevo:');
console.log(JSON.stringify(qrDataNuevo, null, 2));

const resultado = simularValidacionQR(JSON.stringify(qrDataNuevo));

console.log('\n📊 Resultado del diagnóstico:');
console.log(JSON.stringify(resultado, null, 2));

if (resultado.success) {
  console.log('\n🎉 ¡QR VÁLIDO! El sistema debería funcionar correctamente.');
} else {
  console.log('\n❌ QR INVÁLIDO - Error encontrado:', resultado.error);
  console.log('Mensaje:', resultado.message);
  if (resultado.debug) {
    console.log('Debug:', resultado.debug);
  }
}
