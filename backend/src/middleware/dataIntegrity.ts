/**
 * Middleware de validación de integridad de datos
 */

import { Request, Response, NextFunction } from 'express';
import { validarFechaFutura, validarFechaInicio, validarFechaTermino, validarMontoPositivo, validarEmail, validarTelefono } from '../utils/transactionHelper';

/**
 * Middleware para validar integridad de datos en requests
 * Verifica fechas, montos, emails y referencias
 */
export const validateDataIntegrity = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;

    // Solo validar si hay body y es un POST/PUT/PATCH
    if (!body || !['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Validación adicional de seguridad
    if (typeof body !== 'object' || body === null) {
      return next();
    }

    // Validar fechas de plan
    if (body.fechaInicioPlan) {
      if (!validarFechaInicio(body.fechaInicioPlan)) {
        return res.status(400).json({
          error: 'Fecha de inicio del plan debe ser válida (puede ser pasada, actual o futura)',
          field: 'fechaInicioPlan',
          value: body.fechaInicioPlan
        });
      }
    }

    if (body.fechaTerminoPlan) {
      if (!validarFechaTermino(body.fechaTerminoPlan)) {
        return res.status(400).json({
          error: 'Fecha de término del plan debe ser futura',
          field: 'fechaTerminoPlan',
          value: body.fechaTerminoPlan
        });
      }
    }

    // Validar montos positivos
    if (body.monto !== undefined) {
      if (!validarMontoPositivo(body.monto)) {
        return res.status(400).json({
          error: 'El monto debe ser un número positivo',
          field: 'monto',
          value: body.monto
        });
      }
    }

    if (body.precio !== undefined) {
      if (!validarMontoPositivo(body.precio)) {
        return res.status(400).json({
          error: 'El precio debe ser un número positivo',
          field: 'precio',
          value: body.precio
        });
      }
    }

    // Validar email
    if (body.email) {
      if (!validarEmail(body.email)) {
        return res.status(400).json({
          error: 'El email debe tener un formato válido',
          field: 'email',
          value: body.email
        });
      }
    }

    // Validar teléfono
    if (body.telefono) {
      if (!validarTelefono(body.telefono)) {
        return res.status(400).json({
          error: 'El teléfono debe tener un formato válido',
          field: 'telefono',
          value: body.telefono
        });
      }
    }

    // Validar límites de clases
    if (body.limiteClases) {
      const limitesValidos = ['12', '8', 'todos_los_dias'];
      if (!limitesValidos.includes(body.limiteClases)) {
        return res.status(400).json({
          error: 'Límite de clases inválido',
          field: 'limiteClases',
          value: body.limiteClases,
          validValues: limitesValidos
        });
      }
    }

    // Validar duración
    if (body.duracion) {
      const duracionesValidas = ['mensual', 'trimestral', 'semestral', 'anual'];
      if (!duracionesValidas.includes(body.duracion)) {
        return res.status(400).json({
          error: 'Duración inválida',
          field: 'duracion',
          value: body.duracion,
          validValues: duracionesValidas
        });
      }
    }

    // Validar descuento especial
    if (body.descuentoEspecial) {
      const descuentosValidos = ['ninguno', 'familiar_x2', 'familiar_x3'];
      if (!descuentosValidos.includes(body.descuentoEspecial)) {
        return res.status(400).json({
          error: 'Descuento especial inválido',
          field: 'descuentoEspecial',
          value: body.descuentoEspecial,
          validValues: descuentosValidos
        });
      }
    }

    // Validar porcentaje de descuento
    if (body.porcentajeDescuento !== undefined) {
      if (typeof body.porcentajeDescuento !== 'number' || 
          body.porcentajeDescuento < 0 || 
          body.porcentajeDescuento > 100) {
        return res.status(400).json({
          error: 'El porcentaje de descuento debe ser un número entre 0 y 100',
          field: 'porcentajeDescuento',
          value: body.porcentajeDescuento
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en validación de integridad de datos:', error);
    // En caso de error, continuar sin validar para no romper la funcionalidad
    return next();
  }
};

/**
 * Middleware específico para validar fechas
 */
export const validateDates = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;

    // Validar que fechaInicioPlan sea anterior a fechaTerminoPlan
    if (body.fechaInicioPlan && body.fechaTerminoPlan) {
      const inicio = new Date(body.fechaInicioPlan);
      const termino = new Date(body.fechaTerminoPlan);

      if (inicio >= termino) {
        return res.status(400).json({
          error: 'La fecha de inicio debe ser anterior a la fecha de término',
          fechaInicio: body.fechaInicioPlan,
          fechaTermino: body.fechaTerminoPlan
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en validación de fechas:', error);
    next();
  }
};

/**
 * Middleware específico para validar montos
 */
export const validateAmounts = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;

    // Validar monto
    if (body.monto !== undefined && !validarMontoPositivo(body.monto)) {
      return res.status(400).json({
        error: 'El monto debe ser un número positivo',
        field: 'monto',
        value: body.monto
      });
    }

    // Validar precio
    if (body.precio !== undefined && !validarMontoPositivo(body.precio)) {
      return res.status(400).json({
        error: 'El precio debe ser un número positivo',
        field: 'precio',
        value: body.precio
      });
    }

    next();
  } catch (error) {
    console.error('Error en validación de montos:', error);
    next();
  }
};
