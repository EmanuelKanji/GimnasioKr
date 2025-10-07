import { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../config/logger';

export const healthCheck = async (req: Request, res: Response) => {
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
    if (mongoose.connection.readyState !== 1) {
      health.status = 'ERROR';
      health.services.database = 'DISCONNECTED';
      return res.status(503).json(health);
    }

    logger.info('Health check passed', { health });
    res.status(200).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : String(error) });
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Verificar que la base de datos esté conectada
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'NOT_READY',
        reason: 'Database not connected'
      });
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      reason: error instanceof Error ? error.message : String(error)
    });
  }
};
