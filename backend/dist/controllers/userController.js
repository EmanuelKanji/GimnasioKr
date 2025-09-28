"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const createUser = async (req, res) => {
    const { username, password, role, rut } = req.body;
    if (!username || !password || !role || !rut) {
        return res.status(400).json({ error: 'Todos los campos son requeridos (correo, rut, password, rol)' });
    }
    if (!['alumno', 'profesor'].includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }
    try {
        const exists = await User_1.default.findOne({ username });
        if (exists) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }
        const user = new User_1.default({ username, password, role, rut });
        await user.save();
        return res.status(201).json({ message: 'Usuario creado correctamente', user: { username, rut, role } });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error al crear usuario' });
    }
};
exports.createUser = createUser;
