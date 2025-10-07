"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const indexes_1 = require("./indexes");
const connectDB = async () => {
    try {
        const uriFromEnv = process.env.MONGODB_URI;
        if (!uriFromEnv || uriFromEnv.trim() === '') {
            throw new Error('MONGODB_URI no está definida o está vacía');
        }
        await mongoose_1.default.connect(uriFromEnv, {
            maxPoolSize: 10, // Mantener hasta 10 conexiones
            serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
            socketTimeoutMS: 45000, // Timeout de socket de 45 segundos
            bufferCommands: false // Deshabilitar buffering de comandos
        });
        console.log('✅ Conexión a MongoDB exitosa');
        // Crear índices solo en producción o cuando se especifique
        if (process.env.NODE_ENV === 'production' || process.env.CREATE_INDEXES === 'true') {
            await (0, indexes_1.createIndexes)();
        }
    }
    catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
