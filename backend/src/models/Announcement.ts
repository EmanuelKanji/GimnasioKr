import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  titulo: string;
  contenido: string;
  autorId: mongoose.Types.ObjectId;
  fechaPublicacion: Date;
  fechaExpiracion?: Date;
  activo: boolean;
  dirigidoA: 'todos' | 'alumnos' | 'profesores';
  prioridad: 'baja' | 'media' | 'alta';
}

const AnnouncementSchema: Schema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaPublicacion: {
    type: Date,
    default: Date.now
  },
  fechaExpiracion: {
    type: Date
  },
  activo: {
    type: Boolean,
    default: true
  },
  dirigidoA: {
    type: String,
    enum: ['todos', 'alumnos', 'profesores'],
    default: 'todos'
  },
  prioridad: {
    type: String,
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  }
}, {
  timestamps: true
});

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);