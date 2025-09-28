"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uriFromEnv = process.env.MONGODB_URI;
        if (!uriFromEnv || uriFromEnv.trim() === '') {
            throw new Error('MONGODB_URI no está definida o está vacía');
        }
        await mongoose_1.default.connect(uriFromEnv);
        console.log('✅ Conexión a MongoDB exitosa');
    }
    catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
