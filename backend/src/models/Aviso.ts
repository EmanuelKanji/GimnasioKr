import mongoose, { Schema, Document } from 'mongoose';

export interface IAviso extends Document {
  titulo: string;
  mensaje: string;
  fecha: Date;
  profesor: string; // id o rut del profesor
  destinatarios: string[]; // ruts de alumnos
  leidoPor: string[]; // ruts de alumnos que han leído el aviso
}

const AvisoSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  profesor: { type: String, required: true },
  destinatarios: [{ type: String, required: true }],
  leidoPor: [{ type: String, default: [] }],
});

export default mongoose.model<IAviso>('Aviso', AvisoSchema);
