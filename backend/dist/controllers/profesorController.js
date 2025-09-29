"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginProfesor = exports.actualizarPerfilProfesor = exports.obtenerPerfilProfesor = void 0;
const Profesor_1 = __importDefault(require("../models/Profesor"));
const obtenerPerfilProfesor = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const profesor = await Profesor_1.default.findOne({ rut });
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
        const profesor = await Profesor_1.default.findOneAndUpdate({ rut }, update, { new: true, upsert: true });
        res.json(profesor);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
};
exports.actualizarPerfilProfesor = actualizarPerfilProfesor;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
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
        const token = jsonwebtoken_1.default.sign({ id: userObj._id, username: userObj.username, role: userObj.role, rut }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
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
