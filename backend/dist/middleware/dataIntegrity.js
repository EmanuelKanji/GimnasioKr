"use strict";
/**
 * Middleware de validación de integridad de datos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAmounts = exports.validateDates = exports.validateDataIntegrity = void 0;
const transactionHelper_1 = require("../utils/transactionHelper");
/**
 * Middleware para validar integridad de datos en requests
 * Verifica fechas, montos, emails y referencias
 */
const validateDataIntegrity = (req, res, next) => {
    try {
        const { body } = req;
        // Validar fechas futuras
        if (body.fechaInicioPlan) {
            if (!(0, transactionHelper_1.validarFechaFutura)(body.fechaInicioPlan)) {
                return res.status(400).json({
                    error: 'Fecha de inicio del plan debe ser futura',
                    field: 'fechaInicioPlan',
                    value: body.fechaInicioPlan
                });
            }
        }
        if (body.fechaTerminoPlan) {
            if (!(0, transactionHelper_1.validarFechaFutura)(body.fechaTerminoPlan)) {
                return res.status(400).json({
                    error: 'Fecha de término del plan debe ser futura',
                    field: 'fechaTerminoPlan',
                    value: body.fechaTerminoPlan
                });
            }
        }
        // Validar montos positivos
        if (body.monto !== undefined) {
            if (!(0, transactionHelper_1.validarMontoPositivo)(body.monto)) {
                return res.status(400).json({
                    error: 'El monto debe ser un número positivo',
                    field: 'monto',
                    value: body.monto
                });
            }
        }
        if (body.precio !== undefined) {
            if (!(0, transactionHelper_1.validarMontoPositivo)(body.precio)) {
                return res.status(400).json({
                    error: 'El precio debe ser un número positivo',
                    field: 'precio',
                    value: body.precio
                });
            }
        }
        // Validar email
        if (body.email) {
            if (!(0, transactionHelper_1.validarEmail)(body.email)) {
                return res.status(400).json({
                    error: 'El email debe tener un formato válido',
                    field: 'email',
                    value: body.email
                });
            }
        }
        // Validar teléfono
        if (body.telefono) {
            if (!(0, transactionHelper_1.validarTelefono)(body.telefono)) {
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
    }
    catch (error) {
        console.error('Error en validación de integridad de datos:', error);
        // En caso de error, continuar sin validar para no romper la funcionalidad
        next();
    }
};
exports.validateDataIntegrity = validateDataIntegrity;
/**
 * Middleware específico para validar fechas
 */
const validateDates = (req, res, next) => {
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
    }
    catch (error) {
        console.error('Error en validación de fechas:', error);
        next();
    }
};
exports.validateDates = validateDates;
/**
 * Middleware específico para validar montos
 */
const validateAmounts = (req, res, next) => {
    try {
        const { body } = req;
        // Validar monto
        if (body.monto !== undefined && !(0, transactionHelper_1.validarMontoPositivo)(body.monto)) {
            return res.status(400).json({
                error: 'El monto debe ser un número positivo',
                field: 'monto',
                value: body.monto
            });
        }
        // Validar precio
        if (body.precio !== undefined && !(0, transactionHelper_1.validarMontoPositivo)(body.precio)) {
            return res.status(400).json({
                error: 'El precio debe ser un número positivo',
                field: 'precio',
                value: body.precio
            });
        }
        next();
    }
    catch (error) {
        console.error('Error en validación de montos:', error);
        next();
    }
};
exports.validateAmounts = validateAmounts;
