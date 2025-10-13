"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/verificarAlumnoPM2X.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const Plan_1 = __importDefault(require("../models/Plan"));
const db_1 = require("../config/db");
async function verificarYCorregirAlumnoPM2X() {
    try {
        await (0, db_1.connectDB)();
        console.log('🔗 Conectado a la base de datos');
        const rutAlumno = '1234567899';
        console.log(`\n🔍 === VERIFICANDO ALUMNO RUT: ${rutAlumno} ===`);
        // 1. Buscar el alumno
        const alumno = await Alumno_1.default.findOne({ rut: rutAlumno });
        if (!alumno) {
            console.log(`❌ Alumno con RUT ${rutAlumno} no encontrado`);
            return;
        }
        console.log('✅ Alumno encontrado:');
        console.log(`   Nombre: ${alumno.nombre}`);
        console.log(`   RUT: ${alumno.rut}`);
        console.log(`   Plan: ${alumno.plan}`);
        console.log(`   limiteClases: ${alumno.limiteClases}`);
        console.log(`   Fecha inicio: ${alumno.fechaInicioPlan}`);
        console.log(`   Fecha fin: ${alumno.fechaTerminoPlan}`);
        // 2. Verificar si el plan existe en la colección Plan
        console.log(`\n🔍 === VERIFICANDO PLAN: ${alumno.plan} ===`);
        const plan = await Plan_1.default.findOne({ nombre: alumno.plan });
        if (!plan) {
            console.log(`❌ Plan "${alumno.plan}" no encontrado en la colección Plan`);
            return;
        }
        console.log('✅ Plan encontrado:');
        console.log(`   Nombre: ${plan.nombre}`);
        console.log(`   Descripción: ${plan.descripcion}`);
        console.log(`   Clases: ${plan.clases}`);
        console.log(`   limiteClases: ${plan.limiteClases}`);
        // 3. Verificar si hay inconsistencia
        console.log(`\n🔍 === VERIFICANDO INCONSISTENCIAS ===`);
        const hayInconsistencia = alumno.limiteClases !== plan.limiteClases;
        if (hayInconsistencia) {
            console.log(`❌ INCONSISTENCIA DETECTADA:`);
            console.log(`   Alumno.limiteClases: ${alumno.limiteClases}`);
            console.log(`   Plan.limiteClases: ${plan.limiteClases}`);
            // 4. Corregir la inconsistencia
            console.log(`\n🔧 === CORRIGIENDO INCONSISTENCIA ===`);
            await Alumno_1.default.updateOne({ _id: alumno._id }, { limiteClases: plan.limiteClases });
            console.log(`✅ Alumno actualizado:`);
            console.log(`   limiteClases: ${alumno.limiteClases} → ${plan.limiteClases}`);
        }
        else {
            console.log(`✅ No hay inconsistencias. Datos correctos.`);
        }
        // 5. Verificar que la búsqueda funcione
        console.log(`\n🔍 === VERIFICANDO BÚSQUEDA ===`);
        const planes = await Plan_1.default.find();
        const planEncontrado = planes.find(p => p.nombre === alumno.plan);
        if (planEncontrado) {
            console.log(`✅ Búsqueda exitosa: Plan "${alumno.plan}" encontrado`);
            console.log(`   Clases: ${planEncontrado.clases}`);
            console.log(`   limiteClases: ${planEncontrado.limiteClases}`);
        }
        else {
            console.log(`❌ Búsqueda fallida: Plan "${alumno.plan}" no encontrado`);
        }
        console.log(`\n🎉 === VERIFICACIÓN COMPLETADA ===`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        if (mongoose_1.default.connection.readyState === 1) {
            await mongoose_1.default.disconnect();
            console.log('🔌 Desconectado de la base de datos');
        }
    }
}
// Ejecutar el script
verificarYCorregirAlumnoPM2X();
