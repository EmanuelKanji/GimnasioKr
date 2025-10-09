"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const db_1 = require("../config/db");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function agregarCamposDescuento() {
    try {
        await (0, db_1.connectDB)();
        console.log('🔗 Conectado a la base de datos');
        // Buscar alumnos que no tienen los campos de descuento
        const alumnos = await Alumno_1.default.find({
            $or: [
                { descuentoEspecial: { $exists: false } },
                { porcentajeDescuento: { $exists: false } }
            ]
        });
        console.log(`📊 Encontrados ${alumnos.length} alumnos sin campos de descuento`);
        if (alumnos.length === 0) {
            console.log('✅ Todos los alumnos ya tienen los campos de descuento');
            process.exit(0);
        }
        let actualizados = 0;
        for (const alumno of alumnos) {
            try {
                // Agregar campos con valores por defecto
                if (!alumno.descuentoEspecial) {
                    alumno.descuentoEspecial = 'ninguno';
                }
                if (alumno.porcentajeDescuento === undefined || alumno.porcentajeDescuento === null) {
                    alumno.porcentajeDescuento = 0;
                }
                await alumno.save();
                actualizados++;
                console.log(`✅ Actualizado: ${alumno.nombre} (${alumno.rut})`);
            }
            catch (error) {
                console.error(`❌ Error actualizando alumno ${alumno.rut}:`, error);
            }
        }
        console.log(`\n🎉 Migración completa: ${actualizados} alumnos actualizados`);
    }
    catch (error) {
        console.error('❌ Error en la migración:', error);
    }
    finally {
        mongoose_1.default.disconnect();
        process.exit(0);
    }
}
agregarCamposDescuento();
