"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
// Middleware de validación genérico
const validate = (schema) => {
    return (req, res, next) => {
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
exports.validate = validate;
// Esquemas de validación
exports.schemas = {
    // Login
    login: joi_1.default.object({
        username: joi_1.default.string().email().required().messages({
            'string.email': 'El username debe ser un email válido',
            'any.required': 'El username es requerido'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es requerida'
        })
    }),
    // Crear usuario
    createUser: joi_1.default.object({
        username: joi_1.default.string().email().required().messages({
            'string.email': 'El username debe ser un email válido',
            'any.required': 'El username es requerido'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es requerida'
        }),
        role: joi_1.default.string().valid('alumno', 'profesor').required().messages({
            'any.only': 'El rol debe ser alumno o profesor',
            'any.required': 'El rol es requerido'
        }),
        rut: joi_1.default.string().pattern(/^[0-9]+-[0-9kK]$/).required().messages({
            'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
            'any.required': 'El RUT es requerido'
        }),
        limiteClases: joi_1.default.string().valid('12', '8', 'todos_los_dias').default('12').messages({
            'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
        })
    }),
    // Crear alumno
    createAlumno: joi_1.default.object({
        nombre: joi_1.default.string().min(2).max(50).required().messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 50 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        rut: joi_1.default.string().pattern(/^[0-9]+-[0-9kK]$/).required().messages({
            'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
            'any.required': 'El RUT es requerido'
        }),
        direccion: joi_1.default.string().min(5).max(100).required().messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede exceder 100 caracteres',
            'any.required': 'La dirección es requerida'
        }),
        fechaNacimiento: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
            'any.required': 'La fecha de nacimiento es requerida'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': 'El email debe ser válido',
            'any.required': 'El email es requerido'
        }),
        telefono: joi_1.default.string().pattern(/^[+]?[0-9\s-()]{8,15}$/).required().messages({
            'string.pattern.base': 'El teléfono debe tener formato válido',
            'any.required': 'El teléfono es requerido'
        }),
        plan: joi_1.default.string().min(1).required().messages({
            'any.required': 'El plan es requerido'
        }),
        fechaInicioPlan: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
            'any.required': 'La fecha de inicio del plan es requerida'
        }),
        duracion: joi_1.default.string().valid('mensual', 'trimestral', 'anual').required().messages({
            'any.only': 'La duración debe ser mensual, trimestral o anual',
            'any.required': 'La duración es requerida'
        }),
        monto: joi_1.default.number().min(0).required().messages({
            'number.min': 'El monto debe ser mayor o igual a 0',
            'any.required': 'El monto es requerido'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es requerida'
        }),
        limiteClases: joi_1.default.string().valid('12', '8', 'todos_los_dias').default('12').messages({
            'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
        }),
        fechaTerminoPlan: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
            'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD'
        })
    }),
    // Crear plan
    createPlan: joi_1.default.object({
        nombre: joi_1.default.string().min(2).max(50).required().messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 50 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        descripcion: joi_1.default.string().min(10).max(200).required().messages({
            'string.min': 'La descripción debe tener al menos 10 caracteres',
            'string.max': 'La descripción no puede exceder 200 caracteres',
            'any.required': 'La descripción es requerida'
        }),
        precio: joi_1.default.number().min(0).required().messages({
            'number.min': 'El precio debe ser mayor o igual a 0',
            'any.required': 'El precio es requerido'
        }),
        clases: joi_1.default.string().valid('12', '8', 'todos_los_dias').required().messages({
            'any.only': 'Las clases deben ser 12, 8 o todos_los_dias',
            'any.required': 'Las clases son requeridas'
        }),
        matricula: joi_1.default.alternatives().try(joi_1.default.string().min(1), joi_1.default.number().min(0)).required().messages({
            'any.required': 'La matrícula es requerida'
        }),
        duracion: joi_1.default.string().valid('mensual', 'trimestral', 'anual').required().messages({
            'any.only': 'La duración debe ser mensual, trimestral o anual',
            'any.required': 'La duración es requerida'
        }),
        limiteClases: joi_1.default.string().valid('12', '8', 'todos_los_dias').default('12').messages({
            'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
        })
    }),
    // Registrar asistencia
    registrarAsistencia: joi_1.default.object({
        rut: joi_1.default.string().pattern(/^[0-9]+-[0-9kK]$/).required().messages({
            'string.pattern.base': 'El RUT debe tener formato válido (12345678-9)',
            'any.required': 'El RUT es requerido'
        }),
        qrData: joi_1.default.object({
            rut: joi_1.default.string().pattern(/^[0-9]+-[0-9kK]$/),
            timestamp: joi_1.default.number().integer().min(0),
            hash: joi_1.default.string().min(1)
        }).optional()
    }),
    // Crear aviso
    createAviso: joi_1.default.object({
        titulo: joi_1.default.string().min(5).max(100).required().messages({
            'string.min': 'El título debe tener al menos 5 caracteres',
            'string.max': 'El título no puede exceder 100 caracteres',
            'any.required': 'El título es requerido'
        }),
        mensaje: joi_1.default.string().min(10).max(500).required().messages({
            'string.min': 'El mensaje debe tener al menos 10 caracteres',
            'string.max': 'El mensaje no puede exceder 500 caracteres',
            'any.required': 'El mensaje es requerido'
        }),
        destinatarios: joi_1.default.array().items(joi_1.default.string().pattern(/^[0-9]+-[0-9kK]$/)).min(1).required().messages({
            'array.min': 'Debe seleccionar al menos un destinatario',
            'any.required': 'Los destinatarios son requeridos'
        })
    })
};
