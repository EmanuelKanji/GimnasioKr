"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/pruebasAsistenciasCompletas.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Alumno_1 = __importDefault(require("../models/Alumno"));
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const Plan_1 = __importDefault(require("../models/Plan"));
const db_1 = require("../config/db");
const attendanceService_1 = require("../services/attendanceService");
// Función para crear un alumno de prueba
async function crearAlumnoPrueba(rut, nombre, plan, limiteClases, fechaInicio, fechaFin) {
    const alumno = new Alumno_1.default({
        nombre,
        rut,
        direccion: 'Dirección de prueba',
        fechaNacimiento: '1990-01-01',
        email: `${rut}@test.com`,
        telefono: '12345678',
        plan,
        fechaInicioPlan: fechaInicio,
        fechaTerminoPlan: fechaFin,
        duracion: 'mensual',
        monto: 50000,
        limiteClases,
        asistencias: []
    });
    return await alumno.save();
}
// Función para agregar asistencias a un alumno
async function agregarAsistencias(rut, fechas) {
    const alumno = await Alumno_1.default.findOne({ rut });
    if (!alumno)
        return;
    // Agregar al array del alumno
    alumno.asistencias.push(...fechas);
    await alumno.save();
    // Crear registros en la colección Asistencia
    for (const fecha of fechas) {
        await Asistencia_1.default.create({
            rut,
            fecha: new Date(fecha)
        });
    }
}
// Función para probar un escenario específico
async function probarEscenario(nombre, rut, plan, limiteClases, fechaInicio, fechaFin, asistencias) {
    console.log(`\n🧪 === PRUEBA: ${nombre} ===`);
    console.log(`   RUT: ${rut}`);
    console.log(`   Plan: ${plan} (${limiteClases})`);
    console.log(`   Período: ${fechaInicio} a ${fechaFin}`);
    console.log(`   Asistencias: ${asistencias.length} días`);
    try {
        // Crear alumno
        const alumno = await crearAlumnoPrueba(rut, nombre, plan, limiteClases, fechaInicio, fechaFin);
        // Agregar asistencias
        if (asistencias.length > 0) {
            await agregarAsistencias(rut, asistencias);
        }
        // Recalcular datos
        const alumnoActualizado = await Alumno_1.default.findOne({ rut });
        if (!alumnoActualizado)
            return;
        // Obtener plan
        const planData = await Plan_1.default.findOne({ nombre: plan });
        if (!planData)
            return;
        // Calcular mes actual del plan
        const mesActual = attendanceService_1.AttendanceService.obtenerMesActualDelPlan(alumnoActualizado.fechaInicioPlan, new Date());
        // Filtrar asistencias del período
        const asistenciasFiltradas = attendanceService_1.AttendanceService.filtrarAsistenciasPorPeriodoPlan(alumnoActualizado.asistencias || [], alumnoActualizado.fechaInicioPlan, alumnoActualizado.fechaTerminoPlan);
        // Filtrar asistencias del mes actual
        const asistenciasMesActual = asistenciasFiltradas.filter(fecha => {
            const fechaAsistencia = new Date(fecha);
            return fechaAsistencia >= mesActual.inicio && fechaAsistencia <= mesActual.fin;
        });
        // Calcular días hábiles
        const diasHabilesMesActual = attendanceService_1.AttendanceService.calcularDiasHabiles(mesActual.inicio, mesActual.fin);
        const diasHabilesRestantes = attendanceService_1.AttendanceService.calcularDiasHabilesRestantes(mesActual.fin, new Date());
        // Aplicar protocolo del gimnasio
        let limiteReal = diasHabilesMesActual;
        let puedeAcceder = true;
        let mensaje = '';
        if (limiteClases !== 'todos_los_dias') {
            const limiteNumero = parseInt(limiteClases);
            limiteReal = attendanceService_1.AttendanceService.aplicarProtocoloGimnasio(limiteNumero, diasHabilesRestantes);
            puedeAcceder = asistenciasMesActual.length < limiteReal;
            mensaje = puedeAcceder
                ? `Puede acceder (${asistenciasMesActual.length}/${limiteReal})`
                : `No puede acceder (${asistenciasMesActual.length}/${limiteReal})`;
        }
        else {
            puedeAcceder = diasHabilesRestantes > 0;
            mensaje = puedeAcceder
                ? `Puede acceder (${diasHabilesRestantes} días restantes)`
                : `No puede acceder (0 días restantes)`;
        }
        // Mostrar resultados
        console.log(`\n📊 RESULTADOS:`);
        console.log(`   Mes actual del plan: ${mesActual.numeroMes}`);
        console.log(`   Período del mes: ${mesActual.inicio.toISOString().split('T')[0]} a ${mesActual.fin.toISOString().split('T')[0]}`);
        console.log(`   Días hábiles del mes: ${diasHabilesMesActual}`);
        console.log(`   Días hábiles restantes: ${diasHabilesRestantes}`);
        console.log(`   Asistencias del período: ${asistenciasFiltradas.length}`);
        console.log(`   Asistencias del mes: ${asistenciasMesActual.length}`);
        console.log(`   Límite real aplicado: ${limiteReal}`);
        console.log(`   Puede acceder: ${puedeAcceder ? 'SÍ' : 'NO'}`);
        console.log(`   Mensaje: ${mensaje}`);
        // Verificar lógica del QR
        console.log(`\n🔍 VERIFICACIÓN QR:`);
        console.log(`   Clases usadas: ${asistenciasMesActual.length} de ${limiteReal}`);
        console.log(`   Clases restantes: ${Math.max(0, limiteReal - asistenciasMesActual.length)}`);
        console.log(`   Estado: ${puedeAcceder ? 'ACTIVO' : 'BLOQUEADO'}`);
        return {
            alumno: alumnoActualizado,
            plan: planData,
            mesActual,
            asistenciasFiltradas,
            asistenciasMesActual,
            diasHabilesMesActual,
            diasHabilesRestantes,
            limiteReal,
            puedeAcceder,
            mensaje
        };
    }
    catch (error) {
        console.error(`❌ Error en prueba ${nombre}:`, error);
        return null;
    }
}
async function ejecutarPruebasCompletas() {
    try {
        await (0, db_1.connectDB)();
        console.log('🔗 Conectado a la base de datos');
        // Limpiar datos de pruebas anteriores
        console.log('\n🧹 Limpiando datos de pruebas anteriores...');
        await Alumno_1.default.deleteMany({ rut: { $regex: /^TEST/ } });
        await Asistencia_1.default.deleteMany({ rut: { $regex: /^TEST/ } });
        const hoy = new Date();
        const hace15Dias = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000);
        const en15Dias = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000);
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
        console.log('\n🎯 === INICIANDO PRUEBAS EXHAUSTIVAS ===');
        // PRUEBA 1: Plan PM 2X (8 clases) - Sin asistencias
        await probarEscenario('Test PM 2X Sin Asistencias', 'TEST001', 'PM 2X', '8', hace15Dias.toISOString().split('T')[0], en15Dias.toISOString().split('T')[0], []);
        // PRUEBA 2: Plan PM 2X (8 clases) - Con pocas asistencias
        await probarEscenario('Test PM 2X Pocas Asistencias', 'TEST002', 'PM 2X', '8', hace15Dias.toISOString().split('T')[0], en15Dias.toISOString().split('T')[0], [
            (new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        ]);
        // PRUEBA 3: Plan PM 3X (12 clases) - Con muchas asistencias
        await probarEscenario('Test PM 3X Muchas Asistencias', 'TEST003', 'PM 3X', '12', hace15Dias.toISOString().split('T')[0], en15Dias.toISOString().split('T')[0], [
            (new Date(hoy.getTime() - 10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 8 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 6 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 4 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        ]);
        // PRUEBA 4: Plan "Todos los días" - Sin asistencias
        await probarEscenario('Test Todos los Días Sin Asistencias', 'TEST004', 'Todos los días', 'todos_los_dias', hace15Dias.toISOString().split('T')[0], en15Dias.toISOString().split('T')[0], []);
        // PRUEBA 5: Plan "Todos los días" - Con asistencias
        await probarEscenario('Test Todos los Días Con Asistencias', 'TEST005', 'Todos los días', 'todos_los_dias', hace15Dias.toISOString().split('T')[0], en15Dias.toISOString().split('T')[0], [
            (new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        ]);
        // PRUEBA 6: Plan próximo a vencer (pocos días restantes)
        const hace2Dias = new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000);
        const en2Dias = new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000);
        await probarEscenario('Test Plan Próximo a Vencer', 'TEST006', 'PM 2X', '8', hace2Dias.toISOString().split('T')[0], en2Dias.toISOString().split('T')[0], [
            (new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        ]);
        // PRUEBA 7: Plan ya vencido
        const hace5Dias = new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000);
        const hace1Dia = new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000);
        await probarEscenario('Test Plan Vencido', 'TEST007', 'PM 2X', '8', hace5Dias.toISOString().split('T')[0], hace1Dia.toISOString().split('T')[0], [
            (new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        ]);
        // PRUEBA 8: Plan trimestral (múltiples meses)
        await probarEscenario('Test Plan Trimestral', 'TEST008', 'PM 2X', '8', hace30Dias.toISOString().split('T')[0], en30Dias.toISOString().split('T')[0], [
            (new Date(hoy.getTime() - 25 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 20 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            (new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        ]);
        console.log('\n🎉 === PRUEBAS COMPLETADAS ===');
        console.log('📊 Revisa los resultados de cada prueba arriba para verificar que el sistema funciona correctamente en todos los escenarios.');
    }
    catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
    finally {
        if (mongoose_1.default.connection.readyState === 1) {
            await mongoose_1.default.disconnect();
            console.log('🔌 Desconectado de la base de datos');
        }
    }
}
// Ejecutar las pruebas
ejecutarPruebasCompletas();
