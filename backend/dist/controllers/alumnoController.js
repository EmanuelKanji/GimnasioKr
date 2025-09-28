"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearAlumno = exports.loginAlumno = exports.obtenerAlumnos = exports.obtenerPerfilAlumno = exports.obtenerAvisosAlumno = exports.obtenerAsistenciaAlumno = exports.obtenerPlanAlumno = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
// Obtener plan del alumno por RUT
const obtenerPlanAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        if (!rut)
            return res.status(400).json({ message: 'RUT no presente en el token' });
        const alumno = await Alumno_1.default.findOne({ rut });
        if (!alumno)
            return res.status(404).json({ message: 'Alumno no encontrado' });
        res.json({ plan: {
                nombre: alumno.plan,
                descripcion: 'Acceso ilimitado a clases grupales y uso de gimnasio.',
                fechaInicio: alumno.fechaInicioPlan,
                fechaFin: alumno.fechaTerminoPlan,
                estadoPago: 'pagado',
                monto: alumno.monto
            } });
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
        // Generar JWT con rut
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            username: user.username,
            role: user.role,
            rut: alumno ? alumno.rut : undefined
        }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
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
        const { nombre, rut, direccion, fechaNacimiento, email, telefono, plan, fechaInicioPlan, duracion, monto, password } = req.body;
        if (!nombre || !rut || !direccion || !fechaNacimiento || !email || !telefono || !plan || !fechaInicioPlan || !duracion || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
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
            plan,
            fechaInicioPlan,
            fechaTerminoPlan: termino.toISOString(),
            duracion,
            monto,
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
