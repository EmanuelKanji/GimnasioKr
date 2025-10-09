import mongoose, { Schema, Document } from 'mongoose';

export interface IAviso extends Document {
  titulo: string;
  mensaje: string;
  fecha: Date;
  profesor: string; // id o rut del profesor
  destinatarios: string[]; // ruts de alumnos
  leidoPor: string[]; // ruts de alumnos que han leído el aviso
  tipo?: 'manual' | 'automatico'; // Tipo de aviso
  motivoAutomatico?: string; // Razón del aviso automático (ej: vencimiento_plan_7_dias)
}

const AvisoSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  profesor: { type: String, required: true },
  destinatarios: [{ type: String, required: true }],
  leidoPor: [{ type: String, default: [] }],
  tipo: { type: String, enum: ['manual', 'automatico'], default: 'manual' },
  motivoAutomatico: { type: String }
});

export default mongoose.model<IAviso>('Aviso', AvisoSchema);
