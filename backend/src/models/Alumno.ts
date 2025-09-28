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
  asistencias: string[]; // Fechas ISO
  avisos: {
    titulo: string;
    mensaje: string;
    fecha: string;
    leido: boolean;
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
}, {
  timestamps: true
});

export default mongoose.model<IAlumno>('Alumno', AlumnoSchema);
