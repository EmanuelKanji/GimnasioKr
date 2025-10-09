"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarAsistencia = exports.obtenerHistorialAsistencia = void 0;
const Alumno_1 = __importDefault(require("../models/Alumno"));
const obtenerHistorialAsistencia = async (_req, res) => {
    try {
        const asistencias = await Asistencia_1.default.find().sort({ fecha: -1 });
        // Buscar datos del alumno por rut limpio
        const limpiarRut = (rut) => rut.replace(/\.|-/g, '').toUpperCase();
        const historial = await Promise.all(asistencias.map(async (asistencia) => {
            // Buscar alumno cuyo rut limpio coincida
            const alumnos = await Alumno_1.default.find();
            const alumno = alumnos.find(a => limpiarRut(a.rut) === limpiarRut(asistencia.rut));
            return {
                rut: asistencia.rut,
                fecha: asistencia.fecha,
                nombre: alumno?.nombre || 'No encontrado',
                email: alumno?.email || '',
                telefono: alumno?.telefono || '',
                plan: alumno?.plan || '',
            };
        }));
        res.json(historial);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener historial de asistencia', error });
    }
};
exports.obtenerHistorialAsistencia = obtenerHistorialAsistencia;
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const registrarAsistencia = async (req, res) => {
    try {
        // Puede recibir solo RUT (legacy) o datos completos del QR (nuevo sistema)
        const { rut, qrData } = req.body;
        // Validación básica - debe haber al menos un RUT
        if (!rut) {
            return res.status(400).json({
                message: 'El RUT es obligatorio.',
                codigo: 'RUT_REQUERIDO'
            });
        }
        // Función auxiliar para limpiar RUT
        const limpiarRut = (r) => r.replace(/\.|-/g, '').toUpperCase();
        // Buscar el alumno en la base de datos
        const AlumnoModel = require('../models/Alumno').default;
        const alumnos = await AlumnoModel.find();
        const alumno = alumnos.find((a) => limpiarRut(a.rut) === limpiarRut(rut));
        // Verificar que el alumno existe
        if (!alumno) {
            return res.status(404).json({
                message: 'Alumno no encontrado en el sistema.',
                codigo: 'ALUMNO_NO_ENCONTRADO'
            });
        }
        // ============= VALIDACIONES DE SEGURIDAD =============
        // 1. Validar que el plan del alumno esté activo (fechas)
        const fechaActual = new Date();
        const fechaInicioPlan = new Date(alumno.fechaInicioPlan);
        const fechaFinPlan = new Date(alumno.fechaTerminoPlan);
        if (fechaActual < fechaInicioPlan) {
            return res.status(403).json({
                message: 'Tu plan aún no ha comenzado. Fecha de inicio: ' + fechaInicioPlan.toLocaleDateString('es-CL'),
                codigo: 'PLAN_NO_INICIADO'
            });
        }
        if (fechaActual > fechaFinPlan) {
            return res.status(403).json({
                message: 'Tu plan ha expirado. Fecha de término: ' + fechaFinPlan.toLocaleDateString('es-CL'),
                codigo: 'PLAN_EXPIRADO'
            });
        }
        // 2. Validaciones adicionales para QR con timestamp (nuevo sistema de seguridad)
        if (qrData) {
            try {
                const datosQR = JSON.parse(qrData);
                // Validar que el QR no haya expirado (timestamp)
                const tiempoActual = Date.now();
                if (datosQR.expiraEn && tiempoActual > datosQR.expiraEn) {
                    return res.status(403).json({
                        message: 'El QR ha expirado. Por favor, genera uno nuevo.',
                        codigo: 'QR_EXPIRADO'
                    });
                }
                // Validar que el QR no sea demasiado antiguo (máximo 10 minutos)
                if (datosQR.timestamp && (tiempoActual - datosQR.timestamp) > (10 * 60 * 1000)) {
                    return res.status(403).json({
                        message: 'El QR es demasiado antiguo. Genera uno nuevo.',
                        codigo: 'QR_ANTIGUO'
                    });
                }
                // Validar que el RUT del QR coincida con el enviado
                if (datosQR.rut && limpiarRut(datosQR.rut) !== limpiarRut(rut)) {
                    return res.status(400).json({
                        message: 'El RUT del QR no coincide.',
                        codigo: 'RUT_NO_COINCIDE'
                    });
                }
                // Validar fechas del plan en el QR (doble verificación)
                if (datosQR.validoHasta && fechaActual > new Date(datosQR.validoHasta)) {
                    return res.status(403).json({
                        message: 'El plan en el QR ha expirado.',
                        codigo: 'PLAN_QR_EXPIRADO'
                    });
                }
                console.log(`✅ QR válido procesado - RUT: ${rut}, Token: ${datosQR.token}, Generado: ${new Date(datosQR.timestamp).toLocaleString()}`);
            }
            catch (parseError) {
                return res.status(400).json({
                    message: 'Formato de QR inválido.',
                    codigo: 'QR_FORMATO_INVALIDO'
                });
            }
        }
        // 3. Verificar que no haya registrado asistencia el mismo día (evitar duplicados)
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;
        if (alumno.asistencias.includes(fechaHoy)) {
            return res.status(409).json({
                message: 'Ya has registrado asistencia hoy.',
                codigo: 'ASISTENCIA_YA_REGISTRADA',
                fecha: fechaHoy
            });
        }
        // 4. Verificar límites de clases del plan considerando días restantes del plan
        const limiteClases = alumno.limiteClases || 'todos_los_dias';
        // Función para calcular días hábiles entre dos fechas
        const calcularDiasHabilesEntreFechas = (inicio, fin) => {
            let diasHabiles = 0;
            const fecha = new Date(inicio);
            while (fecha <= fin) {
                const diaSemana = fecha.getDay();
                // 1 = lunes, 2 = martes, ..., 6 = sábado (0 = domingo se excluye)
                if (diaSemana >= 1 && diaSemana <= 6) {
                    diasHabiles++;
                }
                fecha.setDate(fecha.getDate() + 1);
            }
            return diasHabiles;
        };
        // Calcular días hábiles restantes del plan
        const diasHabilesRestantes = calcularDiasHabilesEntreFechas(fechaActual, fechaFinPlan);
        if (limiteClases === 'todos_los_dias') {
            // Para planes "todos los días", verificar que haya días hábiles restantes
            if (diasHabilesRestantes <= 0) {
                return res.status(403).json({
                    message: 'Tu plan ha terminado. No hay días hábiles restantes.',
                    codigo: 'PLAN_TERMINADO',
                    diasRestantes: diasHabilesRestantes
                });
            }
        }
        else {
            // Para planes con límite específico, verificar límite ajustado
            const limiteNumero = parseInt(limiteClases);
            // Obtener asistencias del mes actual
            const asistenciasMes = alumno.asistencias.filter((fecha) => {
                const fechaAsistencia = new Date(fecha);
                return fechaAsistencia.getFullYear() === yyyy && fechaAsistencia.getMonth() === (parseInt(mm) - 1);
            });
            // Calcular límite real considerando días restantes del plan
            const limiteReal = Math.min(limiteNumero, diasHabilesRestantes);
            if (asistenciasMes.length >= limiteReal) {
                return res.status(403).json({
                    message: `Has alcanzado el límite de ${limiteReal} clases disponibles (${limiteNumero} del plan, ${diasHabilesRestantes} días restantes).`,
                    codigo: 'LIMITE_CLASES_ALCANZADO',
                    limite: limiteReal,
                    limiteOriginal: limiteNumero,
                    diasRestantes: diasHabilesRestantes,
                    usadas: asistenciasMes.length
                });
            }
        }
        // ============= REGISTRO DE ASISTENCIA =============
        // Crear registro en la colección de asistencias
        const asistencia = await Asistencia_1.default.create({
            rut: limpiarRut(rut),
            fecha: new Date()
        });
        // Actualizar el array de asistencias del alumno
        alumno.asistencias.push(fechaHoy);
        await alumno.save();
        // Log de seguridad
        console.log(`📝 Asistencia registrada - RUT: ${rut}, Fecha: ${fechaHoy}, Plan: ${alumno.plan}`);
        // Respuesta exitosa con información adicional
        res.status(201).json({
            message: 'Asistencia registrada exitosamente.',
            codigo: 'ASISTENCIA_REGISTRADA',
            asistencia: {
                rut: rut,
                fecha: fechaHoy,
                hora: new Date().toLocaleTimeString('es-CL'),
                alumno: alumno.nombre,
                plan: alumno.plan
            }
        });
    }
    catch (error) {
        console.error('❌ Error al registrar asistencia:', error);
        res.status(500).json({
            message: 'Error interno del servidor al registrar asistencia',
            codigo: 'ERROR_SERVIDOR',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};
exports.registrarAsistencia = registrarAsistencia;
