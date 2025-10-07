import mongoose from 'mongoose';
import { createIndexes } from './indexes';

export const connectDB = async () => {
  try {
    const uriFromEnv = process.env.MONGODB_URI;

    if (!uriFromEnv || uriFromEnv.trim() === '') {
      throw new Error('MONGODB_URI no está definida o está vacía');
    }

    await mongoose.connect(uriFromEnv, {
      maxPoolSize: 10, // Mantener hasta 10 conexiones
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000, // Timeout de socket de 45 segundos
      bufferCommands: false // Deshabilitar buffering de comandos
    });
    
    console.log('✅ Conexión a MongoDB exitosa');
    
    // Crear índices solo en producción o cuando se especifique
    if (process.env.NODE_ENV === 'production' || process.env.CREATE_INDEXES === 'true') {
      await createIndexes();
    }
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};
