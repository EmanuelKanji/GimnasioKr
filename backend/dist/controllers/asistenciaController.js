"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarAsistencia = exports.obtenerHistorialAsistencia = void 0;
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const transactionHelper_1 = require("../utils/transactionHelper");
const attendanceService_1 = require("../services/attendanceService");
// Función auxiliar para limpiar RUT (centralizada)
const limpiarRut = (rut) => rut.replace(/\.|-/g, '').toUpperCase();
const obtenerHistorialAsistencia = async (_req, res) => {
    try {
        const asistencias = await Asistencia_1.default.find().sort({ fecha: -1 });
        // Buscar datos del alumno por rut limpio
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
        // Usar función centralizada limpiarRut
        const rutLimpio = limpiarRut(rut);
        transactionHelper_1.log.info('Registrando asistencia', {
            rutRecibido: rut,
            rutLimpio: rutLimpio,
            action: 'registrar_asistencia'
        });
        // Buscar el alumno en la base de datos
        const alumno = await Alumno_1.default.findOne({ rut: rutLimpio });
        // Debug: Verificar qué RUTs existen en la BD
        if (!alumno) {
            transactionHelper_1.log.warn('Alumno no encontrado', {
                rutLimpio: rutLimpio,
                action: 'buscar_alumno'
            });
            const todosLosAlumnos = await Alumno_1.default.find({}, 'rut nombre').limit(5);
            transactionHelper_1.log.debug('Primeros 5 alumnos en BD', {
                alumnos: todosLosAlumnos.map(a => ({ rut: a.rut, nombre: a.nombre })),
                totalAlumnos: todosLosAlumnos.length
            });
            return res.status(404).json({
                message: 'Alumno no encontrado en el sistema.',
                codigo: 'ALUMNO_NO_ENCONTRADO',
                debug: {
                    rutRecibido: rut,
                    rutLimpio: rutLimpio,
                    totalAlumnos: todosLosAlumnos.length
                }
            });
        }
        console.log('✅ Alumno encontrado:', { nombre: alumno.nombre, rut: alumno.rut });
        // ============= VALIDACIONES DE SEGURIDAD =============
        // 1. Validar datos del alumno
        if (!alumno.fechaInicioPlan || !alumno.fechaTerminoPlan) {
            return res.status(400).json({
                message: 'El alumno no tiene fechas de plan válidas.',
                codigo: 'PLAN_DATOS_INCOMPLETOS'
            });
        }
        const fechaInicioPlan = new Date(alumno.fechaInicioPlan);
        const fechaFinPlan = new Date(alumno.fechaTerminoPlan);
        if (isNaN(fechaInicioPlan.getTime()) || isNaN(fechaFinPlan.getTime())) {
            return res.status(400).json({
                message: 'Las fechas del plan no son válidas.',
                codigo: 'FECHAS_INVALIDAS'
            });
        }
        // 2. Validar que el plan del alumno esté activo (fechas)
        const fechaActual = new Date();
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
        // 3. Validaciones adicionales para QR con timestamp (nuevo sistema de seguridad)
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
                if (datosQR.rut) {
                    const rutQRLimpio = limpiarRut(datosQR.rut);
                    const rutEnviadoLimpio = limpiarRut(rut);
                    transactionHelper_1.log.info('Validando RUT del QR', {
                        rutOriginal: rut,
                        rutQROriginal: datosQR.rut,
                        rutEnviadoLimpio: rutEnviadoLimpio,
                        rutQRLimpio: rutQRLimpio,
                        coinciden: rutQRLimpio === rutEnviadoLimpio,
                        action: 'validar_rut_qr'
                    });
                    if (rutQRLimpio !== rutEnviadoLimpio) {
                        return res.status(400).json({
                            message: 'El RUT del QR no coincide.',
                            codigo: 'RUT_NO_COINCIDE',
                            debug: {
                                rutEnviado: rut,
                                rutQR: datosQR.rut,
                                rutEnviadoLimpio: rutEnviadoLimpio,
                                rutQRLimpio: rutQRLimpio
                            }
                        });
                    }
                }
                // Validar fechas del plan en el QR (verificación opcional)
                // NOTA: Las fechas del perfil del alumno ya fueron validadas arriba (líneas 104-119)
                // El QR solo debe coincidir con el plan, no validar fechas independientemente
                if (datosQR.plan && datosQR.plan !== alumno.plan) {
                    transactionHelper_1.log.warn('Plan del QR no coincide con el plan del alumno', {
                        planQR: datosQR.plan,
                        planAlumno: alumno.plan,
                        action: 'validar_plan_qr'
                    });
                    // No rechazar por esto, solo loggear para debugging
                }
                // Log de QR procesado exitosamente
                transactionHelper_1.log.info('QR procesado exitosamente', {
                    rut: rutLimpio,
                    planQR: datosQR.plan,
                    planAlumno: alumno.plan,
                    timestamp: new Date(datosQR.timestamp).toISOString(),
                    action: 'qr_procesado'
                });
                console.log(`✅ QR válido procesado - RUT: ${rut}, Token: ${datosQR.token}, Generado: ${new Date(datosQR.timestamp).toLocaleString()}`);
            }
            catch (parseError) {
                return res.status(400).json({
                    message: 'Formato de QR inválido.',
                    codigo: 'QR_FORMATO_INVALIDO'
                });
            }
        }
        // 4. Verificar que no haya registrado asistencia el mismo día (evitar duplicados)
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;
        // Validar que asistencias sea un array
        const asistencias = Array.isArray(alumno.asistencias) ? alumno.asistencias : [];
        if (asistencias.includes(fechaHoy)) {
            transactionHelper_1.log.warn('Asistencia ya registrada hoy', {
                rut: rutLimpio,
                nombre: alumno.nombre,
                fecha: fechaHoy,
                action: 'asistencia_duplicada'
            });
            return res.status(409).json({
                message: 'Ya has registrado asistencia hoy.',
                codigo: 'ASISTENCIA_YA_REGISTRADA',
                fecha: fechaHoy
            });
        }
        // 5. Verificar límites de clases del plan considerando días restantes del plan
        const limiteClases = alumno.limiteClases || 'todos_los_dias';
        // Obtener el mes actual del plan (no mes calendario)
        const mesActual = attendanceService_1.AttendanceService.obtenerMesActualDelPlan(alumno.fechaInicioPlan);
        // Filtrar asistencias del mes actual del plan
        const asistenciasMesActual = attendanceService_1.AttendanceService.filtrarAsistenciasPorPeriodoPlan(asistencias, mesActual.inicio.toISOString(), mesActual.fin.toISOString());
        // Calcular días hábiles restantes del mes actual
        const diasHabilesRestantes = attendanceService_1.AttendanceService.calcularDiasHabilesRestantes(mesActual.fin);
        if (limiteClases === 'todos_los_dias') {
            // Para planes "todos los días", verificar que haya días hábiles restantes
            if (diasHabilesRestantes <= 0) {
                return res.status(403).json({
                    message: 'Tu plan del mes actual ha terminado.',
                    codigo: 'PLAN_MES_TERMINADO',
                    diasRestantes: diasHabilesRestantes
                });
            }
        }
        else {
            // Para planes con límite específico, aplicar protocolo del gimnasio
            const limiteNumero = parseInt(limiteClases);
            // PROTOCOLO DEL GIMNASIO: Reducir límite según días restantes
            const limiteReal = attendanceService_1.AttendanceService.aplicarProtocoloGimnasio(limiteNumero, diasHabilesRestantes);
            if (asistenciasMesActual.length >= limiteReal) {
                return res.status(403).json({
                    message: `Has alcanzado el límite de ${limiteReal} clases disponibles este mes (${limiteNumero} del plan, ${diasHabilesRestantes} días restantes).`,
                    codigo: 'LIMITE_CLASES_ALCANZADO',
                    limite: limiteReal,
                    limiteOriginal: limiteNumero,
                    diasRestantes: diasHabilesRestantes,
                    usadas: asistenciasMesActual.length
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
        // Log de asistencia exitosa
        transactionHelper_1.log.audit('Asistencia registrada', {
            rut: rutLimpio,
            nombre: alumno.nombre,
            fecha: fechaHoy,
            plan: alumno.plan,
            action: 'registrar_asistencia_exitosa'
        });
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
