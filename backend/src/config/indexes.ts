import mongoose from 'mongoose';

// Función para crear índices optimizados para producción
export const createIndexes = async () => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Base de datos no conectada');
    }

    // Índices para colección User
    await mongoose.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ rut: 1 }, { sparse: true });
    await mongoose.connection.db.collection('users').createIndex({ role: 1 });

    // Índices para colección Alumno
    await mongoose.connection.db.collection('alumnos').createIndex({ rut: 1 }, { unique: true });
    await mongoose.connection.db.collection('alumnos').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('alumnos').createIndex({ plan: 1 });
    await mongoose.connection.db.collection('alumnos').createIndex({ fechaInicioPlan: 1 });
    await mongoose.connection.db.collection('alumnos').createIndex({ fechaTerminoPlan: 1 });
    await mongoose.connection.db.collection('alumnos').createIndex({ 
      fechaInicioPlan: 1, 
      fechaTerminoPlan: 1 
    });

    // Índices para colección Asistencia
    await mongoose.connection.db.collection('asistencias').createIndex({ rut: 1 });
    await mongoose.connection.db.collection('asistencias').createIndex({ fecha: 1 });
    await mongoose.connection.db.collection('asistencias').createIndex({ 
      rut: 1, 
      fecha: 1 
    });

    // Índices para colección Plan
    await mongoose.connection.db.collection('plans').createIndex({ nombre: 1 }, { unique: true });
    await mongoose.connection.db.collection('plans').createIndex({ duracion: 1 });

    // Índices para colección Aviso
    await mongoose.connection.db.collection('avisos').createIndex({ profesor: 1 });
    await mongoose.connection.db.collection('avisos').createIndex({ fecha: 1 });
    await mongoose.connection.db.collection('avisos').createIndex({ destinatarios: 1 });

    // Índices para colección Profesor
    await mongoose.connection.db.collection('profesors').createIndex({ rut: 1 }, { unique: true });
    await mongoose.connection.db.collection('profesors').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('profesors').createIndex({ misAlumnos: 1 });

    console.log('✅ Índices de base de datos creados exitosamente');
  } catch (error) {
    console.error('❌ Error al crear índices:', error);
    throw error;
  }
};
