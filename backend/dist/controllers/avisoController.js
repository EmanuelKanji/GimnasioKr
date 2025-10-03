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
        // Limpiar y normalizar RUTs de destinatarios
        const destinatariosLimpios = destinatarios.map(rut => {
            const rutLimpio = rut.replace(/\.|-/g, '').toUpperCase();
            console.log(`📤 RUT original: ${rut} -> RUT limpio: ${rutLimpio}`);
            return rutLimpio;
        });
        const aviso = new Aviso_1.default({
            titulo,
            mensaje,
            profesor,
            destinatarios: destinatariosLimpios
        });
        await aviso.save();
        console.log(`✅ Aviso creado exitosamente con ID: ${aviso._id}`);
        console.log(`✅ Destinatarios finales:`, aviso.destinatarios);
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
        console.log(`🔍 RUT original: ${rut}`);
        // Buscar avisos con diferentes formatos de RUT
        const avisos = await Aviso_1.default.find({
            destinatarios: {
                $in: [
                    rutLimpio, // RUT limpio: 123456789
                    rut, // RUT original: 12.345.678-9
                    rut.replace(/\./g, ''), // RUT sin puntos: 12345678-9
                    rut.replace(/-/g, ''), // RUT sin guión: 12.345.6789
                    rut.replace(/\.|-/g, '').replace(/(\d)(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4'), // Formato con puntos y guión
                    rut.replace(/\.|-/g, '').replace(/(\d)(\d{3})(\d{3})(\d{1})/, '$1$2$3$4') // Formato sin separadores
                ]
            }
        }).sort({ fecha: -1 });
        console.log(`📬 Encontrados ${avisos.length} avisos para el alumno`);
        console.log(`📬 Avisos encontrados:`, avisos.map(a => ({ titulo: a.titulo, destinatarios: a.destinatarios })));
        res.json(avisos);
    }
    catch (err) {
        console.error('❌ Error al obtener avisos del alumno:', err);
        res.status(500).json({ error: 'Error al obtener avisos' });
    }
};
exports.obtenerAvisosAlumno = obtenerAvisosAlumno;
