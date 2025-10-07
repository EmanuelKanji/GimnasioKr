"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.errorLogger = exports.requestLogger = void 0;
const logger_1 = require("../config/logger");
// Middleware para logging de requests
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Interceptar el método end de response para calcular tiempo
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - start;
        (0, logger_1.logRequest)(req, res, responseTime);
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
// Middleware para logging de errores
const errorLogger = (err, req, res, next) => {
    (0, logger_1.logError)(err, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous',
        body: req.body
    });
    next(err);
};
exports.errorLogger = errorLogger;
// Middleware para manejo de errores mejorado
const errorHandler = (err, req, res, next) => {
    // No loguear errores 4xx como errores críticos
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    if (statusCode >= 500) {
        (0, logger_1.logError)(err, {
            method: req.method,
            url: req.url,
            ip: req.ip,
            statusCode
        });
    }
    // Respuesta de error segura
    const errorResponse = {
        error: statusCode >= 500 ? 'Error interno del servidor' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
