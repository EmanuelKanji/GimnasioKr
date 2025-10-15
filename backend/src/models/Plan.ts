import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  clases: string | number;
  matricula: string | number;
  duracion: string; // Ejemplo: 'mensual', 'trimestral', 'semestral', 'anual'
  limiteClases: '12' | '8' | 'todos_los_dias'; // Límite de clases por mes
}

const PlanSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  clases: { type: Schema.Types.Mixed, required: true },
  matricula: { type: Schema.Types.Mixed, required: true },
  duracion: { type: String, required: true },
  limiteClases: { 
    type: String, 
    enum: ['12', '8', 'todos_los_dias'], 
    required: true,
    default: 'todos_los_dias'
  },
}, {
  timestamps: true
});

export default mongoose.model<IPlan>('Plan', PlanSchema);
