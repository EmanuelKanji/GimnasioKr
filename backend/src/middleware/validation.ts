import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Middleware de validación genérico
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos', 
        details: errorMessage 
      });
    }
    
    next();
  };
};

// Esquemas de validación
export const schemas = {
  // Login
  login: Joi.object({
    username: Joi.string().email().required().messages({
      'string.email': 'El username debe ser un email válido',
      'any.required': 'El username es requerido'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    })
  }),

  // Crear usuario
  createUser: Joi.object({
    username: Joi.string().email().required().messages({
      'string.email': 'El username debe ser un email válido',
      'any.required': 'El username es requerido'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    role: Joi.string().valid('alumno', 'profesor').required().messages({
      'any.only': 'El rol debe ser alumno o profesor',
      'any.required': 'El rol es requerido'
    }),
    rut: Joi.string().pattern(/^[0-9]+-[0-9kK]$/).required().messages({
      'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
      'any.required': 'El RUT es requerido'
    }),
    limiteClases: Joi.string().valid('12', '8', 'todos_los_dias').default('12').messages({
      'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
    })
  }),

  // Crear alumno
  createAlumno: Joi.object({
    nombre: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    rut: Joi.string().pattern(/^[0-9]+-[0-9kK]$/).required().messages({
      'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
      'any.required': 'El RUT es requerido'
    }),
    direccion: Joi.string().min(5).max(100).required().messages({
      'string.min': 'La dirección debe tener al menos 5 caracteres',
      'string.max': 'La dirección no puede exceder 100 caracteres',
      'any.required': 'La dirección es requerida'
    }),
    fechaNacimiento: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
      'any.required': 'La fecha de nacimiento es requerida'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido'
    }),
    telefono: Joi.string().pattern(/^[+]?[0-9\s-()]{8,15}$/).required().messages({
      'string.pattern.base': 'El teléfono debe tener formato válido',
      'any.required': 'El teléfono es requerido'
    }),
    plan: Joi.string().min(1).required().messages({
      'any.required': 'El plan es requerido'
    }),
    fechaInicioPlan: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
      'any.required': 'La fecha de inicio del plan es requerida'
    }),
    duracion: Joi.string().valid('mensual', 'trimestral', 'semestral', 'anual').required().messages({
      'any.only': 'La duración debe ser mensual, trimestral, semestral o anual',
      'any.required': 'La duración es requerida'
    }),
    monto: Joi.number().min(0).required().messages({
      'number.min': 'El monto debe ser mayor o igual a 0',
      'any.required': 'El monto es requerido'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
    limiteClases: Joi.string().valid('12', '8', 'todos_los_dias').default('12').messages({
      'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
    }),
    descuentoEspecial: Joi.string()
      .valid('ninguno', 'familiar_x2', 'familiar_x3')
      .default('ninguno')
      .messages({
        'any.only': 'El descuento especial debe ser ninguno, familiar_x2 o familiar_x3'
      }),
    fechaTerminoPlan: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
      'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD'
    })
  }),

  // Crear plan
  createPlan: Joi.object({
    nombre: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    descripcion: Joi.string().min(10).max(200).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 200 caracteres',
      'any.required': 'La descripción es requerida'
    }),
    precio: Joi.number().min(0).required().messages({
      'number.min': 'El precio debe ser mayor o igual a 0',
      'any.required': 'El precio es requerido'
    }),
    clases: Joi.string().valid('12', '8', 'todos_los_dias').required().messages({
      'any.only': 'Las clases deben ser 12, 8 o todos_los_dias',
      'any.required': 'Las clases son requeridas'
    }),
    matricula: Joi.alternatives().try(
      Joi.string().min(1),
      Joi.number().min(0)
    ).required().messages({
      'any.required': 'La matrícula es requerida'
    }),
    duracion: Joi.string().valid('mensual', 'trimestral', 'semestral', 'anual').required().messages({
      'any.only': 'La duración debe ser mensual, trimestral, semestral o anual',
      'any.required': 'La duración es requerida'
    }),
    limiteClases: Joi.string().valid('12', '8', 'todos_los_dias').default('12').messages({
      'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
    })
  }),

  // Registrar asistencia
  registrarAsistencia: Joi.object({
    rut: Joi.string().pattern(/^[0-9]+-[0-9kK]$/).required().messages({
      'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
      'any.required': 'El RUT es requerido'
    }),
    qrData: Joi.object({
      rut: Joi.string().pattern(/^[0-9]+-[0-9kK]$/),
      timestamp: Joi.number().integer().min(0),
      hash: Joi.string().min(1)
    }).optional()
  }),

  // Crear aviso
  createAviso: Joi.object({
    titulo: Joi.string().min(5).max(100).required().messages({
      'string.min': 'El título debe tener al menos 5 caracteres',
      'string.max': 'El título no puede exceder 100 caracteres',
      'any.required': 'El título es requerido'
    }),
    mensaje: Joi.string().min(10).max(500).required().messages({
      'string.min': 'El mensaje debe tener al menos 10 caracteres',
      'string.max': 'El mensaje no puede exceder 500 caracteres',
      'any.required': 'El mensaje es requerido'
    }),
    destinatarios: Joi.array().items(Joi.string().pattern(/^[0-9]+-[0-9kK]$/)).min(1).required().messages({
      'array.min': 'Debe seleccionar al menos un destinatario',
      'any.required': 'Los destinatarios son requeridos'
    })
  }),

  // Renovar plan
  renovarPlan: Joi.object({
    fechaInicio: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'La fecha de inicio debe tener formato YYYY-MM-DD',
      'any.required': 'La fecha de inicio es requerida'
    }),
    fechaFin: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'La fecha de término debe tener formato YYYY-MM-DD',
      'any.required': 'La fecha de término es requerida'
    }),
    duracion: Joi.string().valid('mensual', 'trimestral', 'semestral', 'anual').required().messages({
      'any.only': 'La duración debe ser mensual, trimestral, semestral o anual',
      'any.required': 'La duración es requerida'
    }),
    limiteClases: Joi.string().valid('12', '8', 'todos_los_dias').required().messages({
      'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias',
      'any.required': 'El límite de clases es requerido'
    }),
    descuentoEspecial: Joi.string()
      .valid('ninguno', 'familiar_x2', 'familiar_x3')
      .optional()
      .messages({
        'any.only': 'El descuento especial debe ser ninguno, familiar_x2 o familiar_x3'
      }),
    monto: Joi.number().min(0).optional().messages({
      'number.min': 'El monto debe ser mayor o igual a 0'
    }),
    observaciones: Joi.string().max(500).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 500 caracteres'
    })
  }),

  // Solicitar renovación
  solicitarRenovacion: Joi.object({
    motivo: Joi.string().max(200).optional().messages({
      'string.max': 'El motivo no puede exceder 200 caracteres'
    })
  }),

  // Cambiar contraseña
  cambiarPassword: Joi.object({
    passwordActual: Joi.string().required().messages({
      'any.required': 'La contraseña actual es requerida'
    }),
    passwordNueva: Joi.string().min(6).required().messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    })
  }),

  // Crear profesor
  crearProfesor: Joi.object({
    nombre: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
    rut: Joi.string().pattern(/^\d{1,2}(\.\d{3}){2}-[\dkK]$/).required().messages({
      'string.pattern.base': 'El RUT debe tener el formato 12.345.678-9',
      'any.required': 'El RUT es requerido'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido'
    }),
    telefono: Joi.string().min(8).max(15).required().messages({
      'string.min': 'El teléfono debe tener al menos 8 caracteres',
      'string.max': 'El teléfono no puede exceder 15 caracteres',
      'any.required': 'El teléfono es requerido'
    }),
    direccion: Joi.string().min(5).max(100).required().messages({
      'string.min': 'La dirección debe tener al menos 5 caracteres',
      'string.max': 'La dirección no puede exceder 100 caracteres',
      'any.required': 'La dirección es requerida'
    }),
    fechaNacimiento: Joi.string().required().messages({
      'any.required': 'La fecha de nacimiento es requerida'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    })
  }),

  // Actualizar perfil profesor
  actualizarPerfilProfesor: Joi.object({
    nombre: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'El email debe tener un formato válido'
    }),
    telefono: Joi.string().min(8).max(15).optional().messages({
      'string.min': 'El teléfono debe tener al menos 8 caracteres',
      'string.max': 'El teléfono no puede exceder 15 caracteres'
    }),
    direccion: Joi.string().min(5).max(100).optional().messages({
      'string.min': 'La dirección debe tener al menos 5 caracteres',
      'string.max': 'La dirección no puede exceder 100 caracteres'
    }),
    fechaNacimiento: Joi.string().optional(),
    password: Joi.string().min(6).optional().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres'
    })
  })
};
