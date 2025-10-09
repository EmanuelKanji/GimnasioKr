"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearAlumno = exports.loginAlumno = exports.obtenerAlumnos = exports.obtenerPerfilAlumno = exports.renovarPlanAlumno = exports.obtenerAlumnosParaRenovar = exports.obtenerEstadoRenovacion = exports.solicitarRenovacion = exports.obtenerAvisosAlumno = exports.obtenerAsistenciaAlumno = exports.obtenerPlanAlumno = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const Plan_1 = __importDefault(require("../models/Plan"));
// Obtener plan del alumno por RUT
const obtenerPlanAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const alumno = await Alumno_1.default.findOne({ rut });
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        let nombrePlan = alumno.plan;
        let descripcionPlan = alumno.descripcionPlan || 'Plan de gimnasio';
        let limiteClasesPlan = alumno.limiteClases || 'todos_los_dias';
        // Buscar plan en la colección Plan para obtener descripción actualizada
        if (alumno.plan && alumno.plan.length === 24 && /^[0-9a-fA-F]{24}$/.test(alumno.plan)) {
            try {
                const planEncontrado = await Plan_1.default.findById(alumno.plan);
                if (planEncontrado) {
                    nombrePlan = planEncontrado.nombre;
                    descripcionPlan = planEncontrado.descripcion;
                    limiteClasesPlan = planEncontrado.limiteClases;
                    // Actualizar el alumno con el nombre del plan para futuras consultas
                    await Alumno_1.default.findByIdAndUpdate(alumno._id, {
                        plan: planEncontrado.nombre,
                        descripcionPlan: planEncontrado.descripcion,
                        limiteClases: planEncontrado.limiteClases
                    });
                }
            }
            catch (error) {
                console.error('Error buscando plan por ID:', error);
            }
        }
        else {
            // Buscar plan por nombre para obtener descripción
            try {
                const planEncontrado = await Plan_1.default.findOne({ nombre: alumno.plan });
                if (planEncontrado) {
                    descripcionPlan = planEncontrado.descripcion;
                    limiteClasesPlan = alumno.limiteClases || planEncontrado.limiteClases;
                    // Actualizar descripción del alumno si no la tiene
                    if (!alumno.descripcionPlan) {
                        await Alumno_1.default.findByIdAndUpdate(alumno._id, {
                            descripcionPlan: planEncontrado.descripcion,
                            limiteClases: limiteClasesPlan
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error buscando plan por nombre:', error);
            }
        }
        // Determinar estado de pago basado en si el QR está bloqueado
        const hoy = new Date();
        const inicio = new Date(alumno.fechaInicioPlan);
        const fin = new Date(alumno.fechaTerminoPlan);
        const planActivo = hoy >= inicio && hoy <= fin;
        // Calcular días restantes
        const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        // Determinar si está bloqueado (plan expirado o próximo a vencer sin renovación)
        const estaBloqueado = !planActivo ||
            (diasRestantes < 0) ||
            (diasRestantes <= 3 && alumno.estadoRenovacion !== 'solicitada');
        res.json({
            plan: {
                nombre: nombrePlan,
                descripcion: descripcionPlan,
                fechaInicio: alumno.fechaInicioPlan,
                fechaFin: alumno.fechaTerminoPlan,
                estadoPago: estaBloqueado ? 'bloqueado' : 'activo',
                monto: alumno.monto,
                limiteClases: limiteClasesPlan,
                duracion: alumno.duracion
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener plan de alumno', error });
    }
};
exports.obtenerPlanAlumno = obtenerPlanAlumno;
// Obtener asistencia del alumno por RUT
const obtenerAsistenciaAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const limpiarRut = (r) => r.replace(/\.|-/g, '').toUpperCase();
        const alumnos = await Alumno_1.default.find();
        const alumno = alumnos.find((a) => limpiarRut(a.rut) === limpiarRut(rut));
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        res.json({ diasAsistidos: alumno.asistencias || [] });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener asistencia de alumno', error });
    }
};
exports.obtenerAsistenciaAlumno = obtenerAsistenciaAlumno;
// Obtener avisos del alumno por RUT
const obtenerAvisosAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const alumno = await Alumno_1.default.findOne({ rut });
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        res.json({ avisos: alumno.avisos || [] });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener avisos de alumno', error });
    }
};
exports.obtenerAvisosAlumno = obtenerAvisosAlumno;
// Solicitar renovación (Alumno)
const solicitarRenovacion = async (req, res) => {
    try {
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const { motivo } = req.body;
        const alumno = await Alumno_1.default.findOne({ rut });
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        alumno.estadoRenovacion = 'solicitada';
        alumno.fechaSolicitud = new Date();
        alumno.motivoSolicitud = motivo;
        await alumno.save();
        res.json({ message: 'Solicitud enviada exitosamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al solicitar renovación', error });
    }
};
exports.solicitarRenovacion = solicitarRenovacion;
// Obtener estado de renovación (Alumno)
const obtenerEstadoRenovacion = async (req, res) => {
    try {
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const alumno = await Alumno_1.default.findOne({ rut });
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        res.json({
            estado: alumno.estadoRenovacion || 'ninguno',
            fechaSolicitud: alumno.fechaSolicitud
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener estado de renovación', error });
    }
};
exports.obtenerEstadoRenovacion = obtenerEstadoRenovacion;
// Listar alumnos para renovar (Admin)
const obtenerAlumnosParaRenovar = async (req, res) => {
    try {
        const { filtro } = req.query; // 'todos', 'bloqueados', 'solicitados'
        let query = {};
        if (filtro === 'bloqueados') {
            // Incluir planes expirados y próximos a vencer (3 días o menos)
            const hoy = new Date();
            const proximosDias = new Date();
            proximosDias.setDate(hoy.getDate() + 3);
            query = {
                $or: [
                    { fechaTerminoPlan: { $lt: hoy } }, // Expirados
                    {
                        fechaTerminoPlan: { $gte: hoy, $lte: proximosDias },
                        estadoRenovacion: { $ne: 'solicitada' }
                    } // Próximos a vencer sin solicitud
                ]
            };
        }
        else if (filtro === 'solicitados') {
            query = { estadoRenovacion: 'solicitada' };
        }
        const alumnos = await Alumno_1.default.find(query).select('nombre rut plan fechaInicioPlan fechaTerminoPlan limiteClases estadoRenovacion fechaSolicitud motivoSolicitud');
        res.json(alumnos);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener alumnos para renovar', error });
    }
};
exports.obtenerAlumnosParaRenovar = obtenerAlumnosParaRenovar;
// Renovar plan de alumno (Admin)
const renovarPlanAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaInicio, fechaFin, duracion, limiteClases, observaciones, descuentoEspecial, monto } = req.body;
        console.log('Datos recibidos para renovación:', { id, fechaInicio, fechaFin, duracion, limiteClases, observaciones });
        // Validar que todos los campos requeridos estén presentes
        if (!fechaInicio || !fechaFin || !duracion || !limiteClases) {
            return res.status(400).json({
                message: 'Faltan campos requeridos',
                campos: { fechaInicio, fechaFin, duracion, limiteClases }
            });
        }
        const alumno = await Alumno_1.default.findById(id);
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        // Validar que descuento solo aplique a mensual/trimestral
        if (descuentoEspecial && descuentoEspecial !== 'ninguno') {
            if (duracion === 'semestral' || duracion === 'anual') {
                return res.status(400).json({
                    message: 'Los descuentos familiares no aplican a planes semestrales o anuales'
                });
            }
        }
        // Calcular descuento
        let porcentajeDescuento = 0;
        if (descuentoEspecial === 'familiar_x2') {
            porcentajeDescuento = 10;
        }
        else if (descuentoEspecial === 'familiar_x3') {
            porcentajeDescuento = 15;
        }
        // Aplicar descuento al monto si se proporciona
        let montoConDescuento = alumno.monto; // Mantener monto actual por defecto
        if (monto && monto > 0) {
            montoConDescuento = monto * (1 - porcentajeDescuento / 100);
        }
        // Buscar el plan para obtener la descripción
        let descripcionPlan = 'Plan de gimnasio';
        try {
            const planEncontrado = await Plan_1.default.findOne({ nombre: alumno.plan });
            if (planEncontrado) {
                descripcionPlan = planEncontrado.descripcion;
            }
        }
        catch (error) {
            console.error('Error buscando plan para renovación:', error);
        }
        // Actualizar datos del plan
        alumno.fechaInicioPlan = fechaInicio;
        alumno.fechaTerminoPlan = fechaFin;
        alumno.duracion = duracion;
        alumno.limiteClases = limiteClases;
        alumno.descripcionPlan = descripcionPlan;
        alumno.descuentoEspecial = descuentoEspecial || 'ninguno';
        alumno.porcentajeDescuento = porcentajeDescuento;
        if (monto && monto > 0) {
            alumno.monto = montoConDescuento;
        }
        alumno.estadoRenovacion = 'completada';
        alumno.asistencias = []; // Resetear asistencias del nuevo período
        // Guardar log de renovación
        alumno.historialRenovaciones = alumno.historialRenovaciones || [];
        alumno.historialRenovaciones.push({
            fecha: new Date(),
            fechaInicio,
            fechaFin,
            procesadoPor: req.user?.id,
            observaciones
        });
        console.log('Intentando guardar alumno:', {
            id: alumno._id,
            fechaInicioPlan: alumno.fechaInicioPlan,
            fechaTerminoPlan: alumno.fechaTerminoPlan,
            duracion: alumno.duracion,
            limiteClases: alumno.limiteClases
        });
        try {
            await alumno.save();
            console.log('Alumno guardado exitosamente');
        }
        catch (saveError) {
            console.error('Error al guardar alumno:', saveError);
            throw saveError;
        }
        res.json({
            message: 'Plan renovado exitosamente',
            alumno: {
                nombre: alumno.nombre,
                rut: alumno.rut,
                fechaInicio: alumno.fechaInicioPlan,
                fechaFin: alumno.fechaTerminoPlan,
                limiteClases: alumno.limiteClases
            }
        });
    }
    catch (error) {
        console.error('Error completo en renovarPlanAlumno:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({
            message: 'Error al renovar plan',
            error: errorMessage,
            details: error
        });
    }
};
exports.renovarPlanAlumno = renovarPlanAlumno;
// Obtener perfil de alumno por RUT (extraído del token)
const obtenerPerfilAlumno = async (req, res) => {
    try {
        // El rut ya está en req.user gracias al middleware
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const alumno = await Alumno_1.default.findOne({ rut });
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        res.json({ perfil: alumno });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil de alumno', error });
    }
};
exports.obtenerPerfilAlumno = obtenerPerfilAlumno;
// Obtener lista de alumnos
const obtenerAlumnos = async (_req, res) => {
    try {
        const alumnos = await Alumno_1.default.find();
        res.json(alumnos);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener alumnos', error });
    }
};
exports.obtenerAlumnos = obtenerAlumnos;
// Login de alumno
const loginAlumno = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Validar campos requeridos
        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }
        // Buscar usuario alumno
        const user = await User_1.default.findOne({ username, role: 'alumno' });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Buscar rut del alumno usando el campo rut del usuario
        const alumno = await Alumno_1.default.findOne({ rut: user.rut });
        // Verificar que JWT_SECRET esté definida
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está definida en las variables de entorno');
            return res.status(500).json({ error: 'Error de configuración del servidor' });
        }
        // Generar JWT con rut
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            username: user.username,
            role: user.role,
            rut: alumno ? alumno.rut : undefined
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        return res.status(200).json({
            message: 'Login alumno exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Error en login alumno:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.loginAlumno = loginAlumno;
// Crear alumno
const crearAlumno = async (req, res) => {
    try {
        const { nombre, rut, direccion, fechaNacimiento, email, telefono, plan, fechaInicioPlan, duracion, monto, password, limiteClases, descuentoEspecial } = req.body;
        if (!nombre || !rut || !direccion || !fechaNacimiento || !email || !telefono || !plan || !fechaInicioPlan || !duracion || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        // Buscar el plan por ID para obtener el nombre
        const planEncontrado = await Plan_1.default.findById(plan);
        if (!planEncontrado) {
            return res.status(404).json({ message: 'Plan no encontrado.' });
        }
        // Verificar si el usuario ya existe
        const userExistente = await User_1.default.findOne({ username: email });
        if (userExistente) {
            return res.status(409).json({ message: 'El usuario ya está registrado.' });
        }
        // Verificar si el alumno ya existe
        const alumnoExistente = await Alumno_1.default.findOne({ rut });
        if (alumnoExistente) {
            return res.status(409).json({ message: 'El alumno ya está inscrito.' });
        }
        // Validar que descuento solo aplique a mensual/trimestral
        if (descuentoEspecial && descuentoEspecial !== 'ninguno') {
            if (duracion === 'semestral' || duracion === 'anual') {
                return res.status(400).json({
                    message: 'Los descuentos familiares no aplican a planes semestrales o anuales'
                });
            }
        }
        // Calcular descuento
        let porcentajeDescuento = 0;
        if (descuentoEspecial === 'familiar_x2') {
            porcentajeDescuento = 10;
        }
        else if (descuentoEspecial === 'familiar_x3') {
            porcentajeDescuento = 15;
        }
        // Aplicar descuento al monto
        const montoConDescuento = monto * (1 - porcentajeDescuento / 100);
        // Crear usuario para login
        const nuevoUsuario = new User_1.default({ username: email, password, role: 'alumno', rut });
        await nuevoUsuario.save();
        // Calcular fecha de término según duración
        const inicio = new Date(fechaInicioPlan);
        let termino = new Date(inicio);
        if (duracion === 'mensual') {
            termino.setMonth(termino.getMonth() + 1);
        }
        else if (duracion === 'trimestral') {
            termino.setMonth(termino.getMonth() + 3);
        }
        else if (duracion === 'semestral') {
            termino.setMonth(termino.getMonth() + 6);
        }
        else if (duracion === 'anual') {
            termino.setFullYear(termino.getFullYear() + 1);
        }
        // Crear perfil de alumno
        const nuevoAlumno = new Alumno_1.default({
            nombre,
            rut,
            direccion,
            fechaNacimiento,
            email,
            telefono,
            plan: planEncontrado.nombre, // Guardar el nombre del plan en lugar del ID
            fechaInicioPlan,
            fechaTerminoPlan: termino.toISOString(),
            duracion,
            monto: montoConDescuento,
            limiteClases: limiteClases || planEncontrado.limiteClases || 'todos_los_dias',
            descripcionPlan: planEncontrado.descripcion,
            descuentoEspecial: descuentoEspecial || 'ninguno',
            porcentajeDescuento,
            asistencias: [],
            avisos: []
        });
        await nuevoAlumno.save();
        return res.status(201).json({ message: 'Alumno y usuario creados exitosamente.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al inscribir alumno.', error });
    }
};
exports.crearAlumno = crearAlumno;
