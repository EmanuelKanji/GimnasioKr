/**
 * Test directo del procesamiento del QR sin middleware
 */

// Simular exactamente el QR que está enviando el frontend
const qrDataExacto = '{"rut":"134567892","plan":"PM 2X","validoDesde":"2025-10-14T00:00:00.000Z","validoHasta":"2025-11-14T00:00:00.000Z","timestamp":1760454456716,"expiraEn":1760454756716,"token":"t8tujx07r8zins2inykhd","version":"2.0"}';

function testQRDirecto() {
  console.log('🔍 Test QR Directo - Sin Middleware');
  console.log('===================================');
  
  console.log('📱 QR Data:', qrDataExacto);
  console.log('📏 Longitud:', qrDataExacto.length);
  
  // Simular el procesamiento que hace el backend
  try {
    console.log('\n🔄 Intentando parsear QR...');
    const datosQR = JSON.parse(qrDataExacto);
    console.log('✅ QR parseado exitosamente:', {
      campos: Object.keys(datosQR),
      rut: datosQR.rut,
      timestamp: datosQR.timestamp,
      expiraEn: datosQR.expiraEn,
      action: 'qr_parseado'
    });
    
    // Validar estructura del QR (como hace el backend)
    if (!datosQR.rut || datosQR.timestamp === undefined || datosQR.timestamp === null || datosQR.expiraEn === undefined || datosQR.expiraEn === null) {
      console.log('❌ QR con estructura incompleta:', {
        tieneRut: !!datosQR.rut,
        tieneTimestamp: !!datosQR.timestamp,
        tieneExpiraEn: !!datosQR.expiraEn,
        camposPresentes: Object.keys(datosQR)
      });
    } else {
      console.log('✅ QR estructura válida');
    }
    
    // Validar timestamps
    const tiempoActual = Date.now();
    console.log('\n🕐 Validando timestamps:', {
      tiempoActual: tiempoActual,
      timestampQR: datosQR.timestamp,
      expiraEnQR: datosQR.expiraEn,
      diferenciaTimestamp: tiempoActual - datosQR.timestamp,
      diferenciaExpira: tiempoActual - datosQR.expiraEn,
      esFuturo: datosQR.timestamp > tiempoActual
    });
    
    if (datosQR.expiraEn && tiempoActual > datosQR.expiraEn) {
      console.log('❌ QR expirado');
    } else {
      console.log('✅ QR no expirado');
    }
    
    if (datosQR.timestamp && datosQR.timestamp <= tiempoActual && (tiempoActual - datosQR.timestamp) > (5 * 60 * 1000)) {
      console.log('❌ QR demasiado antiguo');
    } else {
      console.log('✅ QR no es demasiado antiguo');
    }
    
  } catch (parseError) {
    console.log('❌ Error parseando QR:', {
      error: parseError instanceof Error ? parseError.message : String(parseError),
      qrDataLength: qrDataExacto?.length || 0,
      qrDataTipo: typeof qrDataExacto
    });
  }
  
  console.log('\n===================================');
  console.log('Test completado');
}

testQRDirecto();
