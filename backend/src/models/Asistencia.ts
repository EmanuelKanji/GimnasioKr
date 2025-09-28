import mongoose, { Schema, Document } from 'mongoose';

export interface IAsistencia extends Document {
  rut: string;
  fecha: Date;
}

const AsistenciaSchema: Schema = new Schema({
  rut: { type: String, required: true },
  fecha: { type: Date, required: true, default: Date.now },
}, {
  timestamps: true
});

export default mongoose.model<IAsistencia>('Asistencia', AsistenciaSchema);
