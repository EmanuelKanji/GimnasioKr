"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginProfesor = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const loginProfesor = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Validar campos requeridos
        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }
        // Buscar usuario profesor
        const user = await User_1.default.findOne({ username, role: 'profesor' });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        return res.status(200).json({
            message: 'Login profesor exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Error en login profesor:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.loginProfesor = loginProfesor;
