"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readinessCheck = exports.healthCheck = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Verifica que las variables de entorno críticas estén configuradas
 */
const checkEnvironmentVariables = () => {
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'NODE_ENV'
    ];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    return {
        valid: missing.length === 0,
        missing: missing,
        total: requiredVars.length,
        configured: requiredVars.length - missing.length
    };
};
/**
 * Verifica el estado de la conexión a MongoDB
 */
const checkDatabaseConnection = async () => {
    try {
        const state = mongoose_1.default.connection.readyState;
        const states = {
            0: 'DISCONNECTED',
            1: 'CONNECTED',
            2: 'CONNECTING',
            3: 'DISCONNECTING'
        };
        return {
            status: states[state] || 'UNKNOWN',
            readyState: state,
            connected: state === 1,
            host: mongoose_1.default.connection.host,
            port: mongoose_1.default.connection.port,
            name: mongoose_1.default.connection.name
        };
    }
    catch (error) {
        return {
            status: 'ERROR',
            connected: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
/**
 * Verifica el uso de memoria del proceso
 */
const checkMemoryUsage = () => {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const externalMB = Math.round(usage.external / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);
    return {
        heap: {
            used: usedMB,
            total: totalMB,
            percentage: Math.round((usedMB / totalMB) * 100)
        },
        external: externalMB,
        rss: rssMB,
        healthy: (usedMB / totalMB) < 0.9 // Considerar saludable si usa menos del 90%
    };
};
/**
 * Verifica el estado general del sistema
 */
const healthCheck = async (req, res) => {
    try {
        const startTime = Date.now();
        // Verificar variables de entorno
        const envCheck = checkEnvironmentVariables();
        // Verificar conexión a base de datos
        const dbCheck = await checkDatabaseConnection();
        // Verificar uso de memoria
        const memoryCheck = checkMemoryUsage();
        const responseTime = Date.now() - startTime;
        // Determinar estado general
        let overallStatus = 'OK';
        if (!envCheck.valid || !dbCheck.connected || !memoryCheck.healthy) {
            overallStatus = 'DEGRADED';
        }
        const health = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            uptime: Math.round(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: dbCheck,
                memory: memoryCheck,
                environment: envCheck
            },
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                pid: process.pid,
                cpuUsage: process.cpuUsage()
            }
        };
        // Si hay problemas críticos, devolver error
        if (!envCheck.valid || !dbCheck.connected) {
            health.status = 'ERROR';
            logger_1.default.error('Health check failed - critical issues detected', { health });
            return res.status(503).json(health);
        }
        // Si hay problemas menores, devolver warning
        if (overallStatus === 'DEGRADED') {
            logger_1.default.warn('Health check degraded - minor issues detected', { health });
            return res.status(200).json(health);
        }
        logger_1.default.info('Health check passed', {
            status: health.status,
            responseTime: health.responseTime,
            memoryUsage: memoryCheck.heap.percentage
        });
        res.status(200).json(health);
    }
    catch (error) {
        logger_1.default.error('Health check failed with exception', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.healthCheck = healthCheck;
const readinessCheck = async (req, res) => {
    try {
        // Verificar que la base de datos esté conectada
        if (mongoose_1.default.connection.readyState !== 1) {
            return res.status(503).json({
                status: 'NOT_READY',
                reason: 'Database not connected'
            });
        }
        res.status(200).json({
            status: 'READY',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'NOT_READY',
            reason: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.readinessCheck = readinessCheck;
