import { Request, Response, NextFunction } from 'express';
import logger, { logRequest, logError } from '../config/logger';

// Middleware para logging de requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Interceptar el método end de response para calcular tiempo
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    const responseTime = Date.now() - start;
    logRequest(req, res, responseTime);
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Middleware para logging de errores
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logError(err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous',
    body: req.body
  });
  
  next(err);
};

// Middleware para manejo de errores mejorado
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // No loguear errores 4xx como errores críticos
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  if (statusCode >= 500) {
    logError(err, {
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
