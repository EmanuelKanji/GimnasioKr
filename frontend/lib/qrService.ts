/**
 * Servicio centralizado para el procesamiento de códigos QR
 * Unifica la lógica de validación, parsing y logging de QR
 */

export interface QRData {
  rut: string;
}

export interface QRProcessResult {
  rut: string;
  qrData: string | null;
  isValid: boolean;
  type: 'new' | 'legacy' | 'unknown';
  originalData?: string;
}

export class QRService {
  /**
   * Procesa un código QR escaneado (solo RUT)
   */
  static processQR(qrData: string): QRProcessResult {
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
      // Intentar parsear como JSON
      const datosQR = JSON.parse(qrData);
      
      if (datosQR.rut) {
        return {
          rut: datosQR.rut,
          qrData: null, // No devolver el QR completo
          isValid: true,
          type: 'new',
          originalData: qrData
        };
      }
    } catch {
      // Si no se puede parsear, buscar RUT directamente
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

    return {
      rut: '',
      qrData: null,
      isValid: false,
      type: 'unknown',
      originalData: qrData
    };
  }

  /**
   * Valida si un QR es válido para el sistema
   */
  static validateQR(qrData: string): boolean {
    const result = this.processQR(qrData);
    return result.isValid;
  }

  /**
   * Obtiene el RUT de un QR procesado
   */
  static extractRUT(qrData: string): string {
    const result = this.processQR(qrData);
    return result.rut;
  }

  /**
   * Genera logs consistentes para QR procesados
   */
  static logQR(qrData: QRData, type: 'scanned' | 'detected'): void {
    const prefix = type === 'scanned' ? '📱 QR nuevo formato escaneado' : '📱 QR nuevo formato detectado';
    
    console.log(prefix, {
      rut: qrData.rut
    });
  }

  /**
   * Genera logs para QR legacy
   */
  static logLegacyQR(rut: string): void {
    console.log('📱 QR formato legacy detectado (solo RUT):', rut);
  }

  /**
   * Genera logs para QR desconocido
   */
  static logUnknownQR(qrData: string): void {
    console.log('📱 QR formato desconocido:', qrData);
  }

  /**
   * Procesa QR y genera logs automáticamente
   */
  static processAndLogQR(qrData: string, type: 'scanned' | 'detected' = 'detected'): QRProcessResult {
    const result = this.processQR(qrData);
    
    if (result.isValid) {
      // Solo loggear el RUT, no el QR completo
      console.log(`📱 QR ${type === 'scanned' ? 'escaneado' : 'detectado'}:`, {
        rut: result.rut,
        type: result.type
      });
    } else {
      this.logUnknownQR(qrData);
    }

    // Devolver solo el RUT, no el QR completo
    return {
      rut: result.rut,
      qrData: null, // No devolver el QR completo
      isValid: result.isValid,
      type: result.type,
      originalData: result.originalData
    };
  }

  /**
   * Limpia un RUT removiendo puntos y guiones
   */
  static cleanRUT(rut: string): string {
    return rut.replace(/\.|-/g, '').toUpperCase();
  }

  /**
   * Valida si un RUT tiene formato chileno válido
   */
  static isValidChileanRUT(rut: string): boolean {
    const cleanRut = this.cleanRUT(rut);
    return /^[0-9]{7,8}[0-9kK]$/.test(cleanRut);
  }
}
