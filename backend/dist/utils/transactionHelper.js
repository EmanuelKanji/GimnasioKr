"use strict";
/**
 * Helper para manejo de transacciones y logging estructurado
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggingMiddleware = exports.validarTelefono = exports.validarEmail = exports.validarMontoPositivo = exports.validarFechaTermino = exports.validarFechaInicio = exports.validarFechaFutura = exports.executeWithLogging = exports.executeTransaction = exports.log = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const winston_1 = __importDefault(require("winston"));
// ========================
// CONFIGURACIÓN DE LOGGING
// ========================
// Configurar Winston para logging estructurado
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'gimnasio-api' },
    transports: [
        // Archivo de errores
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Archivo combinado
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
exports.log = {
    /**
     * Log de información general
     */
    info: (message, context) => {
        logger.info(message, context);
    },
    /**
     * Log de advertencias
     */
    warn: (message, context) => {
        logger.warn(message, context);
    },
    /**
     * Log de errores
     */
    error: (message, error, context) => {
        logger.error(message, {
            error: error?.message,
            stack: error?.stack,
            ...context
        });
    },
    /**
     * Log de debug (solo en desarrollo)
     */
    debug: (message, context) => {
        logger.debug(message, context);
    },
    /**
     * Log de operaciones críticas del sistema
     */
    audit: (action, context) => {
        logger.info(`AUDIT: ${action}`, {
            ...context,
            timestamp: new Date().toISOString(),
            level: 'audit'
        });
    }
};
/**
 * Ejecuta múltiples operaciones dentro de una transacción MongoDB
 * Si cualquier operación falla, todas se revierten automáticamente
 *
 * @param operations Array de funciones que reciben una sesión de MongoDB
 * @param context Contexto para logging (opcional)
 * @returns Promise que se resuelve cuando todas las operaciones son exitosas
 */
const executeTransaction = async (operations, context) => {
    const session = await mongoose_1.default.startSession();
    try {
        exports.log.info('Iniciando transacción', {
            operationCount: operations.length,
            ...context
        });
        await session.withTransaction(async () => {
            for (let i = 0; i < operations.length; i++) {
                try {
                    await operations[i](session);
                    exports.log.debug(`Operación ${i + 1}/${operations.length} completada`, context);
                }
                catch (error) {
                    exports.log.error(`Error en operación ${i + 1}/${operations.length}`, error, context);
                    throw error; // Re-lanzar para que la transacción se revierta
                }
            }
        });
        exports.log.info('Transacción completada exitosamente', {
            operationCount: operations.length,
            ...context
        });
    }
    catch (error) {
        exports.log.error('Error en transacción, todas las operaciones revertidas', error, context);
        throw error;
    }
    finally {
        await session.endSession();
    }
};
exports.executeTransaction = executeTransaction;
/**
 * Ejecuta una operación crítica con logging automático
 * Útil para operaciones que no requieren transacciones pero sí logging
 *
 * @param operation Función a ejecutar
 * @param action Descripción de la acción para logging
 * @param context Contexto adicional
 * @returns Resultado de la operación
 */
const executeWithLogging = async (operation, action, context) => {
    const startTime = Date.now();
    try {
        exports.log.info(`Iniciando: ${action}`, context);
        const result = await operation();
        const duration = Date.now() - startTime;
        exports.log.info(`Completado: ${action}`, {
            duration: `${duration}ms`,
            ...context
        });
        return result;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        exports.log.error(`Error en: ${action}`, error, {
            duration: `${duration}ms`,
            ...context
        });
        throw error;
    }
};
exports.executeWithLogging = executeWithLogging;
// ========================
// UTILIDADES DE VALIDACIÓN DE DATOS
// ========================
/**
 * Valida que una fecha sea válida y esté en el futuro
 */
const validarFechaFutura = (fecha) => {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    return !isNaN(fechaObj.getTime()) && fechaObj >= hoy;
};
exports.validarFechaFutura = validarFechaFutura;
/**
 * Valida que una fecha de inicio sea válida (puede ser pasada, actual o futura)
 * Útil para alumnos que ya iniciaron su membresía
 */
const validarFechaInicio = (fecha) => {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    // Permitir fechas pasadas, actuales o futuras, pero no muy antiguas (antes de 2020)
    const fechaMinima = new Date('2020-01-01');
    return !isNaN(fechaObj.getTime()) && fechaObj >= fechaMinima;
};
exports.validarFechaInicio = validarFechaInicio;
/**
 * Valida que una fecha de término sea válida y futura
 * El plan debe terminar en el futuro
 */
const validarFechaTermino = (fecha) => {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return !isNaN(fechaObj.getTime()) && fechaObj > hoy;
};
exports.validarFechaTermino = validarFechaTermino;
/**
 * Valida que un monto sea positivo
 */
const validarMontoPositivo = (monto) => {
    return typeof monto === 'number' && monto > 0 && !isNaN(monto);
};
exports.validarMontoPositivo = validarMontoPositivo;
/**
 * Valida que un email tenga formato válido
 */
const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validarEmail = validarEmail;
/**
 * Valida que un teléfono tenga formato válido
 */
const validarTelefono = (telefono) => {
    const telefonoRegex = /^[0-9+\-\s()]{8,20}$/;
    return telefonoRegex.test(telefono);
};
exports.validarTelefono = validarTelefono;
/**
 * Middleware para logging automático de requests HTTP
 */
const requestLoggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Capturar información del request
    const context = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        rut: req.user?.rut
    };
    // Log del request
    exports.log.info(`Request: ${req.method} ${req.url}`, context);
    // Interceptar el response para logging
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        exports.log.info(`Response: ${req.method} ${req.url}`, {
            ...context,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLoggingMiddleware = requestLoggingMiddleware;
