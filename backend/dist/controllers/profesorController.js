"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginProfesor = exports.obtenerEstadisticasProfesor = exports.obtenerMisAlumnos = exports.eliminarMiAlumno = exports.agregarMiAlumno = exports.actualizarPerfilProfesor = exports.obtenerPerfilProfesor = exports.crearProfesor = void 0;
const Profesor_1 = __importDefault(require("../models/Profesor"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const Aviso_1 = __importDefault(require("../models/Aviso"));
const User_1 = __importDefault(require("../models/User"));
// Crear profesor
const crearProfesor = async (req, res) => {
    try {
        const { nombre, rut, email, telefono, direccion, fechaNacimiento, password } = req.body;
        // Debug: Log de datos recibidos
        console.log('🔍 Backend recibiendo datos de profesor:', {
            nombre,
            rut,
            email,
            telefono,
            direccion,
            fechaNacimiento,
            password: password ? '***' : 'undefined'
        });
        if (!nombre || !rut || !email || !telefono || !direccion || !fechaNacimiento || !password) {
            console.log('❌ Campos faltantes:', {
                nombre: !!nombre,
                rut: !!rut,
                email: !!email,
                telefono: !!telefono,
                direccion: !!direccion,
                fechaNacimiento: !!fechaNacimiento,
                password: !!password
            });
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        // Verificar si el usuario ya existe
        const userExistente = await User_1.default.findOne({ username: email });
        if (userExistente) {
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }
        // Función auxiliar para limpiar RUT (quitar puntos y guiones, convertir K a mayúscula)
        const limpiarRut = (r) => r.replace(/\.|-/g, '').toUpperCase();
        const rutLimpio = limpiarRut(rut);
        console.log('🔍 Crear Profesor - RUT recibido:', rut);
        console.log('🔍 Crear Profesor - RUT limpio:', rutLimpio);
        // Verificar si el profesor ya existe
        const profesorExistente = await Profesor_1.default.findOne({ rut: rutLimpio });
        if (profesorExistente) {
            return res.status(409).json({ error: 'El profesor ya está registrado' });
        }
        // Crear usuario para login
        const nuevoUsuario = new User_1.default({
            username: email,
            password,
            role: 'profesor',
            rut: rutLimpio
        });
        await nuevoUsuario.save();
        // Crear perfil del profesor
        const nuevoProfesor = new Profesor_1.default({
            nombre,
            rut: rutLimpio, // Usar RUT limpio
            email,
            telefono,
            direccion,
            fechaNacimiento,
            misAlumnos: []
        });
        await nuevoProfesor.save();
        console.log(`✅ Profesor creado: ${nombre} (${rut})`);
        res.status(201).json({
            message: 'Profesor creado correctamente',
            profesor: {
                nombre,
                rut,
                email,
                telefono,
                direccion,
                fechaNacimiento
            }
        });
    }
    catch (error) {
        console.error('❌ Error al crear profesor:', error);
        res.status(500).json({ error: 'Error al crear profesor' });
    }
};
exports.crearProfesor = crearProfesor;
const obtenerPerfilProfesor = async (req, res) => {
    try {
        const rut = req.user?.rut;
        console.log('🔍 Debug - RUT del token:', rut);
        console.log('🔍 Debug - Usuario del token:', req.user);
        const profesor = await Profesor_1.default.findOne({ rut });
        console.log('🔍 Debug - Profesor encontrado:', profesor);
        if (!profesor)
            return res.status(404).json({ error: 'Profesor no encontrado' });
        res.json(profesor);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};
exports.obtenerPerfilProfesor = obtenerPerfilProfesor;
const actualizarPerfilProfesor = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const update = req.body;
        console.log('🔍 Backend actualizando perfil profesor:', {
            rut,
            update: { ...update, password: update.password ? '***' : undefined }
        });
        if (!rut) {
            return res.status(400).json({ error: 'RUT no encontrado en el token' });
        }
        // Verificar que el profesor existe
        const profesorExistente = await Profesor_1.default.findOne({ rut });
        if (!profesorExistente) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        // Actualizar campos del modelo Profesor (excluir RUT y password)
        const camposPermitidos = ['nombre', 'email', 'telefono', 'direccion', 'fechaNacimiento'];
        const updateFiltrado = {};
        for (const campo of camposPermitidos) {
            if (update[campo] !== undefined) {
                updateFiltrado[campo] = update[campo];
            }
        }
        console.log('🔍 Campos a actualizar en Profesor:', updateFiltrado);
        // Actualizar modelo Profesor
        const profesor = await Profesor_1.default.findOneAndUpdate({ rut }, updateFiltrado, { new: true, runValidators: true });
        if (!profesor) {
            return res.status(404).json({ error: 'No se pudo actualizar el perfil' });
        }
        // Si se incluye password, actualizar en el modelo User
        if (update.password) {
            console.log('🔍 Actualizando contraseña en User para email:', profesorExistente.email);
            const user = await User_1.default.findOne({
                username: profesorExistente.email,
                role: 'profesor'
            });
            if (user) {
                user.password = update.password; // El pre-save hook hasheará automáticamente
                await user.save(); // Dispara el hook
                console.log('✅ Contraseña actualizada exitosamente en User');
            }
            else {
                console.warn('⚠️ No se encontró usuario para actualizar contraseña');
            }
        }
        console.log('✅ Perfil actualizado exitosamente');
        res.json(profesor);
    }
    catch (err) {
        console.error('❌ Error actualizando perfil profesor:', err);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
};
exports.actualizarPerfilProfesor = actualizarPerfilProfesor;
// Agregar alumno a "mis alumnos"
const agregarMiAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const { rutAlumno } = req.body;
        // Verificar que el alumno existe
        const alumno = await Alumno_1.default.findOne({ rut: rutAlumno });
        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        // Agregar alumno a la lista si no está ya agregado
        const profesor = await Profesor_1.default.findOneAndUpdate({ rut, misAlumnos: { $ne: rutAlumno } }, { $push: { misAlumnos: rutAlumno } }, { new: true, upsert: true });
        res.json({ message: 'Alumno agregado exitosamente', profesor });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al agregar alumno' });
    }
};
exports.agregarMiAlumno = agregarMiAlumno;
// Eliminar alumno de "mis alumnos"
const eliminarMiAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const { rutAlumno } = req.body;
        const profesor = await Profesor_1.default.findOneAndUpdate({ rut }, { $pull: { misAlumnos: rutAlumno } }, { new: true });
        if (!profesor) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        res.json({ message: 'Alumno eliminado exitosamente', profesor });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al eliminar alumno' });
    }
};
exports.eliminarMiAlumno = eliminarMiAlumno;
// Obtener "mis alumnos" con detalles completos
const obtenerMisAlumnos = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const profesor = await Profesor_1.default.findOne({ rut });
        if (!profesor || !profesor.misAlumnos) {
            return res.json([]);
        }
        // Obtener detalles completos de mis alumnos
        const alumnos = await Alumno_1.default.find({ rut: { $in: profesor.misAlumnos } });
        res.json(alumnos);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener mis alumnos' });
    }
};
exports.obtenerMisAlumnos = obtenerMisAlumnos;
// Obtener estadísticas del profesor
const obtenerEstadisticasProfesor = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const profesor = await Profesor_1.default.findOne({ rut });
        if (!profesor) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        // Obtener datos de la semana actual
        const fechaActual = new Date();
        const inicioSemana = new Date(fechaActual);
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay()); // Domingo de esta semana
        inicioSemana.setHours(0, 0, 0, 0);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6); // Sábado de esta semana
        finSemana.setHours(23, 59, 59, 999);
        // Obtener asistencias de la semana de todos los alumnos (para estadísticas generales)
        const asistenciasSemana = await Asistencia_1.default.find({
            fecha: { $gte: inicioSemana, $lte: finSemana }
        });
        // Agrupar asistencias por día
        const asistenciasPorDia = [];
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(inicioSemana.getDate() + i);
            const asistenciasDia = asistenciasSemana.filter(a => {
                const fechaAsistencia = new Date(a.fecha);
                return fechaAsistencia.toDateString() === dia.toDateString();
            });
            asistenciasPorDia.push({
                dia: diasSemana[i],
                asistencia: asistenciasDia.length,
                fecha: dia.toISOString().split('T')[0]
            });
        }
        // Estadísticas de alumnos
        const totalAlumnos = await Alumno_1.default.countDocuments();
        const alumnosActivos = await Alumno_1.default.countDocuments({
            fechaFinPlan: { $gte: new Date() }
        });
        // Contar alumnos nuevos (agregados en la última semana)
        const alumnosNuevos = await Alumno_1.default.countDocuments({
            createdAt: { $gte: inicioSemana }
        });
        // Avisos del profesor (últimos 5)
        const avisos = await Aviso_1.default.find({ profesor: rut })
            .sort({ fecha: -1 })
            .limit(5)
            .select('titulo fecha leidoPor destinatarios');
        // Calcular estadísticas de avisos
        const avisosConEstadisticas = avisos.map(aviso => ({
            id: aviso._id,
            titulo: aviso.titulo,
            fecha: aviso.fecha,
            leido: aviso.leidoPor?.length > 0,
            totalDestinatarios: aviso.destinatarios?.length || 0,
            totalLeidos: aviso.leidoPor?.length || 0
        }));
        // Estadísticas de mis alumnos
        const misAlumnosDetalles = await Alumno_1.default.find({
            rut: { $in: profesor.misAlumnos || [] }
        });
        // Obtener RUTs de mis alumnos para filtrar asistencias
        const rutsMisAlumnos = misAlumnosDetalles.map(alumno => alumno.rut);
        // Asistencias de mis alumnos en la semana actual
        const asistenciasMisAlumnos = await Asistencia_1.default.find({
            rut: { $in: rutsMisAlumnos },
            fecha: { $gte: inicioSemana, $lte: finSemana }
        });
        // Asistencias de mis alumnos hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const finHoy = new Date(hoy);
        finHoy.setHours(23, 59, 59, 999);
        const asistenciasHoyMisAlumnos = await Asistencia_1.default.find({
            rut: { $in: rutsMisAlumnos },
            fecha: { $gte: hoy, $lte: finHoy }
        });
        // Estadísticas detalladas de mis alumnos
        const estadisticasMisAlumnos = misAlumnosDetalles.map(alumno => {
            const asistenciasAlumno = asistenciasMisAlumnos.filter(a => a.rut === alumno.rut);
            const asistenciasHoyAlumno = asistenciasHoyMisAlumnos.filter(a => a.rut === alumno.rut);
            return {
                rut: alumno.rut,
                nombre: alumno.nombre,
                plan: alumno.plan,
                asistenciasSemana: asistenciasAlumno.length,
                asistioHoy: asistenciasHoyAlumno.length > 0,
                ultimaAsistencia: asistenciasAlumno.length > 0
                    ? asistenciasAlumno.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
                    : null
            };
        });
        const estadisticas = {
            asistenciasSemana: asistenciasPorDia,
            alumnos: {
                total: totalAlumnos || 0,
                activos: alumnosActivos || 0,
                nuevos: alumnosNuevos || 0,
                misAlumnos: misAlumnosDetalles.length || 0
            },
            misAlumnosDetallado: estadisticasMisAlumnos || [],
            avisos: avisosConEstadisticas || [],
            resumen: {
                totalAsistenciasSemana: asistenciasSemana.length || 0,
                asistenciasMisAlumnosSemana: asistenciasMisAlumnos.length || 0,
                asistenciasHoyMisAlumnos: asistenciasHoyMisAlumnos.length || 0,
                promedioAsistenciasDiarias: Math.round((asistenciasSemana.length || 0) / 7),
                avisosEnviados: avisos.length || 0,
                fechaActualizacion: new Date()
            }
        };
        res.json(estadisticas);
    }
    catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas del profesor' });
    }
};
exports.obtenerEstadisticasProfesor = obtenerEstadisticasProfesor;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginProfesor = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }
        const user = await User_1.default.findOne({ username, role: 'profesor' });
        console.log('Usuario encontrado en login:', user);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
        const rut = userObj.rut;
        console.log('Login profesor - userObj:', userObj); // Depuración
        // Verificar que JWT_SECRET esté definida
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está definida en las variables de entorno');
            return res.status(500).json({ error: 'Error de configuración del servidor' });
        }
        const token = jsonwebtoken_1.default.sign({ id: userObj._id, username: userObj.username, role: userObj.role, rut }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        return res.status(200).json({
            message: 'Login profesor exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                rut: user.rut
            }
        });
    }
    catch (error) {
        console.error('Error en login profesor:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.loginProfesor = loginProfesor;
