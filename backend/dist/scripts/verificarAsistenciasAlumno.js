"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/verificarAsistenciasAlumno.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const Plan_1 = __importDefault(require("../models/Plan"));
const db_1 = require("../config/db");
const attendanceService_1 = require("../services/attendanceService");
async function verificarAsistenciasAlumno() {
    try {
        await (0, db_1.connectDB)();
        console.log('🔗 Conectado a la base de datos');
        const rutAlumno = '1234567899';
        console.log(`\n🔍 === VERIFICANDO ASISTENCIAS ALUMNO RUT: ${rutAlumno} ===`);
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
        // 2. Obtener el plan
        const plan = await Plan_1.default.findOne({ nombre: alumno.plan });
        if (!plan) {
            console.log(`❌ Plan "${alumno.plan}" no encontrado`);
            return;
        }
        console.log(`\n📋 Plan del alumno:`);
        console.log(`   Nombre: ${plan.nombre}`);
        console.log(`   Clases: ${plan.clases}`);
        console.log(`   limiteClases: ${plan.limiteClases}`);
        // 3. Verificar asistencias en el array del alumno
        console.log(`\n📊 === ASISTENCIAS EN ARRAY DEL ALUMNO ===`);
        console.log(`   Total asistencias: ${alumno.asistencias.length}`);
        console.log(`   Asistencias:`, alumno.asistencias);
        // 4. Verificar asistencias en la colección Asistencia
        console.log(`\n📊 === ASISTENCIAS EN COLECCIÓN ASISTENCIA ===`);
        const asistenciasBD = await Asistencia_1.default.find({ rut: rutAlumno }).sort({ fecha: -1 });
        console.log(`   Total asistencias en BD: ${asistenciasBD.length}`);
        asistenciasBD.forEach((asist, index) => {
            console.log(`   ${index + 1}. ${asist.fecha.toISOString().split('T')[0]} (${asist.fecha.toLocaleString()})`);
        });
        // 5. Verificar filtrado por período del plan
        console.log(`\n📊 === FILTRADO POR PERÍODO DEL PLAN ===`);
        const asistenciasFiltradas = attendanceService_1.AttendanceService.filtrarAsistenciasPorPeriodoPlan(alumno.asistencias || [], alumno.fechaInicioPlan, alumno.fechaTerminoPlan);
        console.log(`   Asistencias del período: ${asistenciasFiltradas.length}`);
        console.log(`   Fechas filtradas:`, asistenciasFiltradas);
        // 6. Calcular mes actual del plan
        console.log(`\n📊 === MES ACTUAL DEL PLAN ===`);
        const mesActual = attendanceService_1.AttendanceService.obtenerMesActualDelPlan(alumno.fechaInicioPlan, new Date());
        console.log(`   Mes actual del plan: ${mesActual.numeroMes}`);
        console.log(`   Inicio del mes: ${mesActual.inicio.toISOString().split('T')[0]}`);
        console.log(`   Fin del mes: ${mesActual.fin.toISOString().split('T')[0]}`);
        // 7. Filtrar asistencias del mes actual
        const asistenciasMesActual = asistenciasFiltradas.filter(fecha => {
            const fechaAsistencia = new Date(fecha);
            return fechaAsistencia >= mesActual.inicio && fechaAsistencia <= mesActual.fin;
        });
        console.log(`   Asistencias del mes actual: ${asistenciasMesActual.length}`);
        console.log(`   Fechas del mes actual:`, asistenciasMesActual);
        // 8. Calcular días hábiles
        console.log(`\n📊 === CÁLCULOS DE DÍAS HÁBILES ===`);
        const diasHabilesMesActual = attendanceService_1.AttendanceService.calcularDiasHabiles(mesActual.inicio, mesActual.fin);
        const diasHabilesRestantes = attendanceService_1.AttendanceService.calcularDiasHabilesRestantes(mesActual.fin, new Date());
        console.log(`   Días hábiles del mes actual: ${diasHabilesMesActual}`);
        console.log(`   Días hábiles restantes: ${diasHabilesRestantes}`);
        // 9. Aplicar protocolo del gimnasio
        if (alumno.limiteClases !== 'todos_los_dias') {
            const limiteNumero = parseInt(alumno.limiteClases);
            const limiteReal = attendanceService_1.AttendanceService.aplicarProtocoloGimnasio(limiteNumero, diasHabilesRestantes);
            console.log(`\n📊 === PROTOCOLO DEL GIMNASIO ===`);
            console.log(`   Límite original: ${limiteNumero}`);
            console.log(`   Días hábiles restantes: ${diasHabilesRestantes}`);
            console.log(`   Límite real aplicado: ${limiteReal}`);
            console.log(`   Asistencias usadas: ${asistenciasMesActual.length}`);
            console.log(`   Puede acceder: ${asistenciasMesActual.length < limiteReal ? 'SÍ' : 'NO'}`);
        }
        // 10. Verificar consistencia entre arrays
        console.log(`\n📊 === VERIFICACIÓN DE CONSISTENCIA ===`);
        const fechasArray = alumno.asistencias.map(f => f.split('T')[0]);
        const fechasBD = asistenciasBD.map(a => a.fecha.toISOString().split('T')[0]);
        const faltanEnArray = fechasBD.filter(fecha => !fechasArray.includes(fecha));
        const faltanEnBD = fechasArray.filter(fecha => !fechasBD.includes(fecha));
        if (faltanEnArray.length > 0) {
            console.log(`❌ Fechas en BD que faltan en array del alumno:`, faltanEnArray);
        }
        if (faltanEnBD.length > 0) {
            console.log(`❌ Fechas en array que faltan en BD:`, faltanEnBD);
        }
        if (faltanEnArray.length === 0 && faltanEnBD.length === 0) {
            console.log(`✅ Arrays consistentes`);
        }
        console.log(`\n🎉 === VERIFICACIÓN DE ASISTENCIAS COMPLETADA ===`);
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
verificarAsistenciasAlumno();
