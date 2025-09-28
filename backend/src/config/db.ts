import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uriFromEnv = process.env.MONGODB_URI;

    if (!uriFromEnv || uriFromEnv.trim() === '') {
      throw new Error('MONGODB_URI no está definida o está vacía');
    }

    await mongoose.connect(uriFromEnv);
    console.log('✅ Conexión a MongoDB exitosa');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};
