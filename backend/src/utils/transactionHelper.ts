/**
 * Helper para manejo de transacciones y logging estructurado
 */

import mongoose from 'mongoose';
import winston from 'winston';

// ========================
// CONFIGURACIÓN DE LOGGING
// ========================

// Configurar Winston para logging estructurado
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gimnasio-api' },
  transports: [
    // Archivo de errores
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo combinado
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// ========================
// INTERFACE DE LOGGING
// ========================

export interface LogContext {
  userId?: string;
  action?: string;
  rut?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export const log = {
  /**
   * Log de información general
   */
  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },

  /**
   * Log de advertencias
   */
  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },

  /**
   * Log de errores
   */
  error: (message: string, error?: Error, context?: LogContext) => {
    logger.error(message, { 
      error: error?.message, 
      stack: error?.stack,
      ...context 
    });
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },

  /**
   * Log de operaciones críticas del sistema
   */
  audit: (action: string, context: LogContext) => {
    logger.info(`AUDIT: ${action}`, {
      ...context,
      timestamp: new Date().toISOString(),
      level: 'audit'
    });
  }
};

// ========================
// MANEJO DE TRANSACCIONES
// ========================

export interface TransactionOperation {
  (session: mongoose.ClientSession): Promise<any>;
}

/**
 * Ejecuta múltiples operaciones dentro de una transacción MongoDB
 * Si cualquier operación falla, todas se revierten automáticamente
 * 
 * @param operations Array de funciones que reciben una sesión de MongoDB
 * @param context Contexto para logging (opcional)
 * @returns Promise que se resuelve cuando todas las operaciones son exitosas
 */
export const executeTransaction = async (
  operations: TransactionOperation[],
  context?: LogContext
): Promise<void> => {
  const session = await mongoose.startSession();
  
  try {
    log.info('Iniciando transacción', { 
      operationCount: operations.length,
      ...context 
    });

    await session.withTransaction(async () => {
      for (let i = 0; i < operations.length; i++) {
        try {
          await operations[i](session);
          log.debug(`Operación ${i + 1}/${operations.length} completada`, context);
        } catch (error) {
          log.error(`Error en operación ${i + 1}/${operations.length}`, error as Error, context);
          throw error; // Re-lanzar para que la transacción se revierta
        }
      }
    });

    log.info('Transacción completada exitosamente', { 
      operationCount: operations.length,
      ...context 
    });

  } catch (error) {
    log.error('Error en transacción, todas las operaciones revertidas', error as Error, context);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Ejecuta una operación crítica con logging automático
 * Útil para operaciones que no requieren transacciones pero sí logging
 * 
 * @param operation Función a ejecutar
 * @param action Descripción de la acción para logging
 * @param context Contexto adicional
 * @returns Resultado de la operación
 */
export const executeWithLogging = async <T>(
  operation: () => Promise<T>,
  action: string,
  context?: LogContext
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    log.info(`Iniciando: ${action}`, context);
    const result = await operation();
    
    const duration = Date.now() - startTime;
    log.info(`Completado: ${action}`, { 
      duration: `${duration}ms`,
      ...context 
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error(`Error en: ${action}`, error as Error, { 
      duration: `${duration}ms`,
      ...context 
    });
    throw error;
  }
};

// ========================
// UTILIDADES DE VALIDACIÓN DE DATOS
// ========================

/**
 * Valida que una fecha sea válida y esté en el futuro
 */
export const validarFechaFutura = (fecha: string | Date): boolean => {
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
  
  return !isNaN(fechaObj.getTime()) && fechaObj >= hoy;
};

/**
 * Valida que un monto sea positivo
 */
export const validarMontoPositivo = (monto: number): boolean => {
  return typeof monto === 'number' && monto > 0 && !isNaN(monto);
};

/**
 * Valida que un email tenga formato válido
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un teléfono tenga formato válido
 */
export const validarTelefono = (telefono: string): boolean => {
  const telefonoRegex = /^[0-9+\-\s()]{8,20}$/;
  return telefonoRegex.test(telefono);
};

// ========================
// MIDDLEWARE DE LOGGING PARA EXPRESS
// ========================

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para logging automático de requests HTTP
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capturar información del request
  const context: LogContext = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    rut: (req as any).user?.rut
  };

  // Log del request
  log.info(`Request: ${req.method} ${req.url}`, context);

  // Interceptar el response para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    log.info(`Response: ${req.method} ${req.url}`, {
      ...context,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    return originalSend.call(this, data);
  };

  next();
};
