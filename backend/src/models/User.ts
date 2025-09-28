import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  fechaNacimiento?: Date;
  rol: 'admin' | 'profesor' | 'alumno';
  activo: boolean;
  planId?: mongoose.Types.ObjectId;
  fechaRegistro: Date;
  qrCode?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  rut: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validación básica de RUT chileno
        return /^[0-9]{7,8}-[0-9Kk]{1}$/.test(v);
      },
      message: 'RUT debe tener formato válido (ej: 12345678-9)'
    }
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  telefono: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date
  },
  rol: {
    type: String,
    enum: ['admin', 'profesor', 'alumno'],
    default: 'alumno'
  },
  activo: {
    type: Boolean,
    default: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);