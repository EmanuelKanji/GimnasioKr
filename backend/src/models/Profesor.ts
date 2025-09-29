import mongoose, { Schema, Document } from 'mongoose';

export interface IProfesor extends Document {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
}

const ProfesorSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  rut: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  fechaNacimiento: { type: String, required: true },
});

export default mongoose.model<IProfesor>('Profesor', ProfesorSchema);
