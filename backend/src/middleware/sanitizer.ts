/**
 * Middleware de sanitización de inputs para prevenir XSS y SQL injection
 */

import { Request, Response, NextFunction } from 'express';
import { sanitizarObjeto } from '../utils/validators';

/**
 * Middleware para sanitizar inputs del request
 * Limpia automáticamente todos los strings en req.body, req.query y req.params
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizarObjeto(req.body);
    }

    // Sanitizar query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizarObjeto(req.query);
    }

    // Sanitizar params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizarObjeto(req.params);
    }

    next();
  } catch (error) {
    console.error('Error en sanitización de inputs:', error);
    // En caso de error, continuar sin sanitizar para no romper la funcionalidad
    next();
  }
};

/**
 * Middleware específico para sanitizar solo el body
 * Útil para endpoints que solo necesitan sanitizar el body
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizarObjeto(req.body);
    }
    next();
  } catch (error) {
    console.error('Error en sanitización del body:', error);
    next();
  }
};

/**
 * Middleware para sanitizar solo campos específicos
 * @param fields Array de nombres de campos a sanitizar
 */
export const sanitizeFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && typeof req.body === 'object') {
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = sanitizarObjeto(req.body[field]);
          }
        });
      }
      next();
    } catch (error) {
      console.error('Error en sanitización de campos específicos:', error);
      next();
    }
  };
};
