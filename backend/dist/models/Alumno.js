"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AlumnoSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    direccion: { type: String, required: true },
    fechaNacimiento: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    plan: { type: String, required: true },
    fechaInicioPlan: { type: String, required: true },
    fechaTerminoPlan: { type: String, required: true },
    duracion: { type: String, required: true },
    monto: { type: Number, required: false, default: 0 },
    limiteClases: {
        type: String,
        enum: ['12', '8', 'todos_los_dias'],
        default: 'todos_los_dias'
    },
    asistencias: { type: [String], default: [] }, // Fechas ISO
    avisos: {
        type: [
            {
                titulo: String,
                mensaje: String,
                fecha: String,
                leido: { type: Boolean, default: false }
            }
        ],
        default: []
    },
    estadoRenovacion: {
        type: String,
        enum: ['ninguno', 'solicitada', 'procesando', 'completada'],
        default: 'ninguno'
    },
    fechaSolicitud: { type: Date },
    motivoSolicitud: { type: String },
    historialRenovaciones: [{
            fecha: { type: Date, default: Date.now },
            fechaInicio: String,
            fechaFin: String,
            procesadoPor: String,
            observaciones: String
        }]
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Alumno', AlumnoSchema);
