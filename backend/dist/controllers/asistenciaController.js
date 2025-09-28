"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarAsistencia = exports.obtenerHistorialAsistencia = void 0;
const Alumno_1 = __importDefault(require("../models/Alumno"));
const obtenerHistorialAsistencia = async (_req, res) => {
    try {
        const asistencias = await Asistencia_1.default.find().sort({ fecha: -1 });
        // Buscar datos del alumno por rut limpio
        const limpiarRut = (rut) => rut.replace(/\.|-/g, '').toUpperCase();
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
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const registrarAsistencia = async (req, res) => {
    try {
        const { rut } = req.body;
        if (!rut) {
            return res.status(400).json({ message: 'El RUT es obligatorio.' });
        }
        const asistencia = await Asistencia_1.default.create({ rut, fecha: new Date() });
        // Actualizar el array de asistencias del alumno
        const AlumnoModel = require('../models/Alumno').default;
        const limpiarRut = (r) => r.replace(/\.|-/g, '').toUpperCase();
        // Buscar todos los alumnos y comparar rut limpio
        const alumnos = await AlumnoModel.find();
        const alumno = alumnos.find((a) => limpiarRut(a.rut) === limpiarRut(rut));
        if (alumno) {
            // Forzar formato YYYY-MM-DD sin hora ni desfase
            const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');
            const fechaHoy = `${yyyy}-${mm}-${dd}`;
            if (!alumno.asistencias.includes(fechaHoy)) {
                alumno.asistencias.push(fechaHoy);
                await alumno.save();
            }
        }
        res.status(201).json({ message: 'Asistencia registrada.', asistencia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al registrar asistencia', error });
    }
};
exports.registrarAsistencia = registrarAsistencia;
