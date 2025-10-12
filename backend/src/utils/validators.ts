/**
 * Utilidades de validación para RUT chileno y contraseñas
 * Funciones idénticas entre frontend y backend para consistencia
 */

// ========================
// VALIDACIÓN DE RUT CHILENO
// ========================

/**
 * Calcula el dígito verificador de un RUT chileno
 * @param rut RUT sin puntos ni guión (ej: "12345678")
 * @returns Dígito verificador calculado (ej: "9" o "K")
 */
export const calcularDigitoVerificador = (rut: string): string => {
  // Limpiar RUT de puntos y guiones
  const rutLimpio = limpiarRut(rut);
  
  // Separar número del dígito verificador
  const numeroRut = rutLimpio.slice(0, -1);
  const dvActual = rutLimpio.slice(-1).toUpperCase();
  
  // Validar que el número sea válido
  if (!/^[0-9]+$/.test(numeroRut) || numeroRut.length < 7 || numeroRut.length > 8) {
    throw new Error('Número de RUT inválido');
  }
  
  // Calcular dígito verificador usando algoritmo chileno
  let suma = 0;
  let multiplicador = 2;
  
  // Recorrer de derecha a izquierda
  for (let i = numeroRut.length - 1; i >= 0; i--) {
    suma += parseInt(numeroRut[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dvCalculado = 11 - resto;
  
  // Mapear resultado a dígito verificador
  if (dvCalculado === 11) return '0';
  if (dvCalculado === 10) return 'K';
  return dvCalculado.toString();
};

/**
 * Valida si un RUT chileno es válido (incluyendo dígito verificador)
 * @param rut RUT con o sin formato (ej: "12.345.678-9" o "123456789")
 * @returns true si el RUT es válido, false en caso contrario
 */
export const validarRutChileno = (rut: string): boolean => {
  try {
    const rutLimpio = limpiarRut(rut);
    
    // Validar formato básico
    if (!/^[0-9]{7,8}[0-9kK]$/.test(rutLimpio)) {
      return false;
    }
    
    // Calcular dígito verificador esperado
    const dvEsperado = calcularDigitoVerificador(rutLimpio);
    const dvActual = rutLimpio.slice(-1).toUpperCase();
    
    return dvEsperado === dvActual;
  } catch {
    return false;
  }
};

/**
 * Limpia un RUT removiendo puntos y guiones
 * @param rut RUT con formato (ej: "12.345.678-9")
 * @returns RUT limpio (ej: "123456789")
 */
export const limpiarRut = (rut: string): string => {
  return rut.replace(/\.|-/g, '').toUpperCase();
};

/**
 * Formatea un RUT limpio al formato estándar chileno
 * @param rut RUT limpio (ej: "123456789")
 * @returns RUT formateado (ej: "12.345.678-9")
 */
export const formatearRut = (rut: string): string => {
  const rutLimpio = limpiarRut(rut);
  
  if (rutLimpio.length < 8 || rutLimpio.length > 9) {
    throw new Error('RUT debe tener entre 8 y 9 caracteres');
  }
  
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Formatear número con puntos
  const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${numeroFormateado}-${dv}`;
};

// ========================
// VALIDACIÓN DE CONTRASEÑAS
// ========================

export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Valida la fortaleza de una contraseña
 * @param password Contraseña a validar
 * @returns Resultado de la validación con mensaje y nivel de fortaleza
 */
export const validarFortalezaPassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;
  
  // Longitud mínima
  if (password.length < 8) {
    errors.push('mínimo 8 caracteres');
  } else {
    score += 1;
  }
  
  // Contiene mayúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('1 mayúscula');
  } else {
    score += 1;
  }
  
  // Contiene minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('1 minúscula');
  } else {
    score += 1;
  }
  
  // Contiene número
  if (!/[0-9]/.test(password)) {
    errors.push('1 número');
  } else {
    score += 1;
  }
  
  // Contiene carácter especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('1 carácter especial');
  } else {
    score += 1;
  }
  
  // Determinar fortaleza
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 3) {
    strength = 'weak';
  } else if (score < 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }
  
  const valid = errors.length === 0;
  const message = valid 
    ? 'Contraseña válida' 
    : `Falta: ${errors.join(', ')}`;
  
  return { valid, message, strength };
};

// ========================
// SANITIZACIÓN DE INPUTS
// ========================

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param input String a sanitizar
 * @returns String sanitizado
 */
export const sanitizarInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    // Remover caracteres HTML peligrosos
    .replace(/[<>]/g, '')
    // Remover caracteres de control
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remover caracteres SQL injection básicos
    .replace(/['";\\]/g, '')
    // Limitar longitud
    .substring(0, 1000)
    // Trim espacios
    .trim();
};

/**
 * Sanitiza un objeto completo recursivamente
 * @param obj Objeto a sanitizar
 * @returns Objeto sanitizado
 */
export const sanitizarObjeto = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizarInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizarObjeto);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizarObjeto(value);
    }
    return sanitized;
  }
  
  return obj;
};
