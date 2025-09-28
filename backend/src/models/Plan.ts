import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  clases: string | number;
  matricula: string | number;
  duracion: string; // Ejemplo: 'mensual', 'trimestral', 'anual'
}

const PlanSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  clases: { type: Schema.Types.Mixed, required: true },
  matricula: { type: Schema.Types.Mixed, required: true },
  duracion: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.model<IPlan>('Plan', PlanSchema);
