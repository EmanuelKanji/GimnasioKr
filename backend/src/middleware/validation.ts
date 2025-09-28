import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para registro de usuario
export const validateUserRegistration = [
  body('rut')
    .matches(/^[0-9]{7,8}-[0-9Kk]{1}$/)
    .withMessage('RUT debe tener formato válido (ej: 12345678-9)'),
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  body('apellido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email debe tener formato válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// Validaciones para login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email debe tener formato válido'),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido'),
  handleValidationErrors
];

// Validaciones para planes
export const validatePlan = [
  body('nombre')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descripción debe tener entre 10 y 500 caracteres'),
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('Precio debe ser un número positivo'),
  body('duracionMeses')
    .isInt({ min: 1, max: 12 })
    .withMessage('Duración debe ser entre 1 y 12 meses'),
  body('clasesPorSemana')
    .isInt({ min: 1, max: 7 })
    .withMessage('Clases por semana debe ser entre 1 y 7'),
  handleValidationErrors
];

// Validaciones para avisos
export const validateAnnouncement = [
  body('titulo')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título debe tener entre 5 y 200 caracteres'),
  body('contenido')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Contenido debe tener entre 10 y 2000 caracteres'),
  body('dirigidoA')
    .isIn(['todos', 'alumnos', 'profesores'])
    .withMessage('Dirigido a debe ser: todos, alumnos o profesores'),
  body('prioridad')
    .isIn(['baja', 'media', 'alta'])
    .withMessage('Prioridad debe ser: baja, media o alta'),
  handleValidationErrors
];