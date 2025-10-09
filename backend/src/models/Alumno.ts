import mongoose, { Schema, Document } from 'mongoose';

export interface IAlumno extends Document {
  nombre: string;
  rut: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  plan: string;
  fechaInicioPlan: string;
  fechaTerminoPlan: string;
  duracion: string;
  monto: number;
  limiteClases: '12' | '8' | 'todos_los_dias'; // Límite de clases por mes
  asistencias: string[]; // Fechas ISO
  avisos: {
    titulo: string;
    mensaje: string;
    fecha: string;
    leido: boolean;
  }[];
  estadoRenovacion: 'ninguno' | 'solicitada' | 'procesando' | 'completada';
  fechaSolicitud?: Date;
  motivoSolicitud?: string;
  historialRenovaciones: {
    fecha: Date;
    fechaInicio: string;
    fechaFin: string;
    procesadoPor: string;
    observaciones: string;
  }[];
}

const AlumnoSchema: Schema = new Schema({
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

export default mongoose.model<IAlumno>('Alumno', AlumnoSchema);
