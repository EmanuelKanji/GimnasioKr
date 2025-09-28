import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMeses: number;
  clasesPorSemana: number;
  activo: boolean;
  fechaCreacion: Date;
}

const PlanSchema: Schema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  duracionMeses: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  clasesPorSemana: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IPlan>('Plan', PlanSchema);