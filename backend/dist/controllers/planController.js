"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarPlan = exports.crearPlan = exports.obtenerPlanes = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const obtenerPlanes = async (_req, res) => {
    try {
        const planes = await Plan_1.default.find();
        res.json(planes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes', error });
    }
};
exports.obtenerPlanes = obtenerPlanes;
const crearPlan = async (req, res) => {
    try {
        const { nombre, descripcion, precio, clases, matricula, duracion } = req.body;
        if (!nombre || !descripcion || !precio || !clases || !matricula || !duracion) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        // Validar que el límite de clases sea válido
        const limiteClasesValidos = ['12', '8', 'todos_los_dias'];
        if (!limiteClasesValidos.includes(clases)) {
            return res.status(400).json({ message: 'Límite de clases inválido. Debe ser: 12, 8 o todos_los_dias' });
        }
        const existe = await Plan_1.default.findOne({ nombre });
        if (existe) {
            return res.status(409).json({ message: 'El plan ya existe.' });
        }
        const nuevoPlan = await Plan_1.default.create({
            nombre,
            descripcion,
            precio,
            clases,
            matricula,
            duracion,
            limiteClases: clases // Mapear clases a limiteClases
        });
        res.status(201).json(nuevoPlan);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el plan', error });
    }
};
exports.crearPlan = crearPlan;
const eliminarPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Plan_1.default.findByIdAndDelete(id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Plan no encontrado.' });
        }
        res.json({ message: 'Plan eliminado correctamente.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plan', error });
    }
};
exports.eliminarPlan = eliminarPlan;
