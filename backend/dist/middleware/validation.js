"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validators_1 = require("../utils/validators");
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
// Validaciones custom de Joi
const customValidations = {
    // Validación de RUT chileno con dígito verificador
    rutChileno: joi_1.default.string().custom((value, helpers) => {
        if (!(0, validators_1.validarRutChileno)(value)) {
            return helpers.error('rut.invalid');
        }
        return value;
    }, 'Validación de RUT chileno').messages({
        'rut.invalid': 'El RUT no es válido. Verifique el dígito verificador.'
    }),
    // Validación de fortaleza de contraseña
    passwordStrong: joi_1.default.string().custom((value, helpers) => {
        const validation = (0, validators_1.validarFortalezaPassword)(value);
        if (!validation.valid) {
            return helpers.error('password.weak', { message: validation.message });
        }
        return value;
    }, 'Validación de fortaleza de contraseña').messages({
        'password.weak': 'La contraseña no cumple los requisitos de seguridad: {{#message}}'
    })
};
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
        password: customValidations.passwordStrong.required().messages({
            'any.required': 'La contraseña es requerida'
        }),
        role: joi_1.default.string().valid('alumno', 'profesor').required().messages({
            'any.only': 'El rol debe ser alumno o profesor',
            'any.required': 'El rol es requerido'
        }),
        rut: customValidations.rutChileno.required().messages({
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
        rut: joi_1.default.string().min(8).max(12).required().messages({
            'string.min': 'El RUT debe tener al menos 8 caracteres',
            'string.max': 'El RUT no puede exceder 12 caracteres',
            'any.required': 'El RUT es requerido'
        }),
        direccion: joi_1.default.string().min(5).max(100).optional().allow('').messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede exceder 100 caracteres'
        }),
        fechaNacimiento: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow('').messages({
            'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': 'El email debe ser válido',
            'any.required': 'El email es requerido'
        }),
        telefono: joi_1.default.string().pattern(/^[+]?[0-9\s-()]{8,15}$/).optional().allow('').messages({
            'string.pattern.base': 'El teléfono debe tener formato válido'
        }),
        plan: joi_1.default.string().min(1).required().messages({
            'any.required': 'El plan es requerido'
        }),
        fechaInicioPlan: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow('').messages({
            'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD'
        }),
        duracion: joi_1.default.string().valid('mensual', 'trimestral', 'semestral', 'anual').required().messages({
            'any.only': 'La duración debe ser mensual, trimestral, semestral o anual',
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
        descuentoEspecial: joi_1.default.string()
            .valid('ninguno', 'familiar_x2', 'familiar_x3')
            .default('ninguno')
            .messages({
            'any.only': 'El descuento especial debe ser ninguno, familiar_x2 o familiar_x3'
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
        duracion: joi_1.default.string().valid('mensual', 'trimestral', 'semestral', 'anual').required().messages({
            'any.only': 'La duración debe ser mensual, trimestral, semestral o anual',
            'any.required': 'La duración es requerida'
        }),
        limiteClases: joi_1.default.string().valid('12', '8', 'todos_los_dias').default('12').messages({
            'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias'
        })
    }),
    // Registrar asistencia
    registrarAsistencia: joi_1.default.object({
        rut: customValidations.rutChileno.required().messages({
            'any.required': 'El RUT es requerido'
        }),
        qrData: joi_1.default.object({
            rut: joi_1.default.string().pattern(/^[0-9]{7,8}[0-9kK]$/),
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
        destinatarios: joi_1.default.array().items(joi_1.default.string().pattern(/^[0-9]{7,8}[0-9kK]$/)).min(1).required().messages({
            'array.min': 'Debe seleccionar al menos un destinatario',
            'any.required': 'Los destinatarios son requeridos'
        })
    }),
    // Renovar plan
    renovarPlan: joi_1.default.object({
        plan: joi_1.default.string().required().messages({
            'any.required': 'El plan es requerido'
        }),
        fechaInicio: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.pattern.base': 'La fecha de inicio debe tener formato YYYY-MM-DD',
            'any.required': 'La fecha de inicio es requerida'
        }),
        fechaFin: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.pattern.base': 'La fecha de término debe tener formato YYYY-MM-DD',
            'any.required': 'La fecha de término es requerida'
        }),
        duracion: joi_1.default.string().valid('mensual', 'trimestral', 'semestral', 'anual').required().messages({
            'any.only': 'La duración debe ser mensual, trimestral, semestral o anual',
            'any.required': 'La duración es requerida'
        }),
        limiteClases: joi_1.default.string().valid('12', '8', 'todos_los_dias').required().messages({
            'any.only': 'El límite de clases debe ser 12, 8 o todos_los_dias',
            'any.required': 'El límite de clases es requerido'
        }),
        descuentoEspecial: joi_1.default.string()
            .valid('ninguno', 'familiar_x2', 'familiar_x3')
            .optional()
            .messages({
            'any.only': 'El descuento especial debe ser ninguno, familiar_x2 o familiar_x3'
        }),
        observaciones: joi_1.default.string().max(500).optional().messages({
            'string.max': 'Las observaciones no pueden exceder 500 caracteres'
        })
    }),
    // Solicitar renovación
    solicitarRenovacion: joi_1.default.object({
        motivo: joi_1.default.string().max(200).optional().messages({
            'string.max': 'El motivo no puede exceder 200 caracteres'
        })
    }),
    // Cambiar contraseña
    cambiarPassword: joi_1.default.object({
        passwordActual: joi_1.default.string().required().messages({
            'any.required': 'La contraseña actual es requerida'
        }),
        passwordNueva: customValidations.passwordStrong.required().messages({
            'any.required': 'La nueva contraseña es requerida'
        })
    }),
    // Crear profesor
    crearProfesor: joi_1.default.object({
        nombre: joi_1.default.string().min(2).max(50).required().messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 50 caracteres',
            'any.required': 'El nombre es requerido'
        }),
        rut: customValidations.rutChileno.required().messages({
            'any.required': 'El RUT es requerido'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': 'El email debe tener un formato válido',
            'any.required': 'El email es requerido'
        }),
        telefono: joi_1.default.string().min(8).max(20).pattern(/^[0-9+\-\s()]+$/).required().messages({
            'string.min': 'El teléfono debe tener al menos 8 caracteres',
            'string.max': 'El teléfono no puede exceder 20 caracteres',
            'string.pattern.base': 'El teléfono solo puede contener números y símbolos (+, -, espacios, paréntesis)',
            'any.required': 'El teléfono es requerido'
        }),
        direccion: joi_1.default.string().min(5).max(100).required().messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede exceder 100 caracteres',
            'any.required': 'La dirección es requerida'
        }),
        fechaNacimiento: joi_1.default.string().required().messages({
            'any.required': 'La fecha de nacimiento es requerida'
        }),
        password: joi_1.default.string().min(6).required().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es requerida'
        })
    }),
    // Actualizar perfil profesor
    actualizarPerfilProfesor: joi_1.default.object({
        nombre: joi_1.default.string().min(2).max(50).optional().messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 50 caracteres'
        }),
        email: joi_1.default.string().email().optional().messages({
            'string.email': 'El email debe tener un formato válido'
        }),
        telefono: joi_1.default.string().min(8).max(20).pattern(/^[0-9+\-\s()]+$/).optional().messages({
            'string.min': 'El teléfono debe tener al menos 8 caracteres',
            'string.max': 'El teléfono no puede exceder 20 caracteres',
            'string.pattern.base': 'El teléfono solo puede contener números y símbolos (+, -, espacios, paréntesis)'
        }),
        direccion: joi_1.default.string().min(5).max(100).optional().messages({
            'string.min': 'La dirección debe tener al menos 5 caracteres',
            'string.max': 'La dirección no puede exceder 100 caracteres'
        }),
        fechaNacimiento: joi_1.default.string().optional(),
        password: joi_1.default.string().min(6).optional().messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres'
        })
    })
};
