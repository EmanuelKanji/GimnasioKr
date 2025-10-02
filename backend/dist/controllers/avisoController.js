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
        if (!profesor) {
            return res.status(400).json({ error: 'Profesor no identificado' });
        }
        if (!titulo || !mensaje || !destinatarios || !Array.isArray(destinatarios)) {
            return res.status(400).json({ error: 'Datos del aviso incompletos' });
        }
        console.log(`📝 Profesor ${profesor} creando aviso para ${destinatarios.length} alumnos:`, destinatarios);
        const aviso = new Aviso_1.default({
            titulo,
            mensaje,
            profesor,
            destinatarios: destinatarios.map(rut => rut.replace(/\.|-/g, '').toUpperCase())
        });
        await aviso.save();
        console.log(`✅ Aviso creado exitosamente con ID: ${aviso._id}`);
        res.status(201).json(aviso);
    }
    catch (err) {
        console.error('❌ Error al crear aviso:', err);
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
        if (!rut) {
            return res.status(400).json({ error: 'RUT del alumno no encontrado' });
        }
        // Limpiar RUT para comparación
        const rutLimpio = rut.replace(/\.|-/g, '').toUpperCase();
        console.log(`🔍 Buscando avisos para alumno RUT: ${rutLimpio}`);
        const avisos = await Aviso_1.default.find({
            destinatarios: { $in: [rutLimpio, rut] } // Buscar tanto con formato limpio como original
        }).sort({ fecha: -1 });
        console.log(`📬 Encontrados ${avisos.length} avisos para el alumno`);
        res.json(avisos);
    }
    catch (err) {
        console.error('❌ Error al obtener avisos del alumno:', err);
        res.status(500).json({ error: 'Error al obtener avisos' });
    }
};
exports.obtenerAvisosAlumno = obtenerAvisosAlumno;
