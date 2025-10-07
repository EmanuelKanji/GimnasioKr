"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Función para crear índices optimizados para producción
const createIndexes = async () => {
    try {
        if (!mongoose_1.default.connection.db) {
            throw new Error('Base de datos no conectada');
        }
        // Índices para colección User
        await mongoose_1.default.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('users').createIndex({ rut: 1 }, { sparse: true });
        await mongoose_1.default.connection.db.collection('users').createIndex({ role: 1 });
        // Índices para colección Alumno
        await mongoose_1.default.connection.db.collection('alumnos').createIndex({ rut: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('alumnos').createIndex({ email: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('alumnos').createIndex({ plan: 1 });
        await mongoose_1.default.connection.db.collection('alumnos').createIndex({ fechaInicioPlan: 1 });
        await mongoose_1.default.connection.db.collection('alumnos').createIndex({ fechaTerminoPlan: 1 });
        await mongoose_1.default.connection.db.collection('alumnos').createIndex({
            fechaInicioPlan: 1,
            fechaTerminoPlan: 1
        });
        // Índices para colección Asistencia
        await mongoose_1.default.connection.db.collection('asistencias').createIndex({ rut: 1 });
        await mongoose_1.default.connection.db.collection('asistencias').createIndex({ fecha: 1 });
        await mongoose_1.default.connection.db.collection('asistencias').createIndex({
            rut: 1,
            fecha: 1
        });
        // Índices para colección Plan
        await mongoose_1.default.connection.db.collection('plans').createIndex({ nombre: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('plans').createIndex({ duracion: 1 });
        // Índices para colección Aviso
        await mongoose_1.default.connection.db.collection('avisos').createIndex({ profesor: 1 });
        await mongoose_1.default.connection.db.collection('avisos').createIndex({ fecha: 1 });
        await mongoose_1.default.connection.db.collection('avisos').createIndex({ destinatarios: 1 });
        // Índices para colección Profesor
        await mongoose_1.default.connection.db.collection('profesors').createIndex({ rut: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('profesors').createIndex({ email: 1 }, { unique: true });
        await mongoose_1.default.connection.db.collection('profesors').createIndex({ misAlumnos: 1 });
        console.log('✅ Índices de base de datos creados exitosamente');
    }
    catch (error) {
        console.error('❌ Error al crear índices:', error);
        throw error;
    }
};
exports.createIndexes = createIndexes;
