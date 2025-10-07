"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readinessCheck = exports.healthCheck = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../config/logger"));
const healthCheck = async (req, res) => {
    try {
        const health = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: 'OK',
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
                }
            }
        };
        // Verificar conexión a la base de datos
        if (mongoose_1.default.connection.readyState !== 1) {
            health.status = 'ERROR';
            health.services.database = 'DISCONNECTED';
            return res.status(503).json(health);
        }
        logger_1.default.info('Health check passed', { health });
        res.status(200).json(health);
    }
    catch (error) {
        logger_1.default.error('Health check failed', { error: error instanceof Error ? error.message : String(error) });
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
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
