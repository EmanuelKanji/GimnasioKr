import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  usuarioId: mongoose.Types.ObjectId;
  fecha: Date;
  horaEntrada: Date;
  horaSalida?: Date;
  metodoRegistro: 'qr' | 'rut' | 'manual';
  registradoPor?: mongoose.Types.ObjectId;
  notas?: string;
}

const AttendanceSchema: Schema = new Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0)
  },
  horaEntrada: {
    type: Date,
    required: true,
    default: Date.now
  },
  horaSalida: {
    type: Date
  },
  metodoRegistro: {
    type: String,
    enum: ['qr', 'rut', 'manual'],
    required: true
  },
  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notas: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados por día
AttendanceSchema.index({ usuarioId: 1, fecha: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);