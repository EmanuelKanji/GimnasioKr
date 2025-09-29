"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerAvisosAlumno = exports.obtenerAvisosProfesor = exports.crearAviso = void 0;
const Aviso_1 = __importDefault(require("../models/Aviso"));
// Crear aviso (POST)
const crearAviso = async (req, res) => {
    try {
        const { titulo, mensaje, destinatarios } = req.body;
        const profesor = req.user?.rut || req.user?.id;
        const aviso = new Aviso_1.default({ titulo, mensaje, profesor, destinatarios });
        await aviso.save();
        res.status(201).json(aviso);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al crear aviso' });
    }
};
exports.crearAviso = crearAviso;
// Obtener avisos enviados por el profesor (GET)
const obtenerAvisosProfesor = async (req, res) => {
    try {
        const profesor = req.user?.rut || req.user?.id;
        const avisos = await Aviso_1.default.find({ profesor }).sort({ fecha: -1 });
        res.json(avisos);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener avisos' });
    }
};
exports.obtenerAvisosProfesor = obtenerAvisosProfesor;
// Obtener avisos para un alumno (GET)
const obtenerAvisosAlumno = async (req, res) => {
    try {
        const rut = req.user?.rut;
        const avisos = await Aviso_1.default.find({ destinatarios: rut }).sort({ fecha: -1 });
        res.json(avisos);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener avisos' });
    }
};
exports.obtenerAvisosAlumno = obtenerAvisosAlumno;
