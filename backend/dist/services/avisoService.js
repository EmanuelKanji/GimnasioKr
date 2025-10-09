"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarPlanesVencidos = exports.enviarAvisosAutomaticos = void 0;
const Alumno_1 = __importDefault(require("../models/Alumno"));
const Aviso_1 = __importDefault(require("../models/Aviso"));
// Función auxiliar para verificar si ya existe un aviso automático reciente
const verificarAvisoDuplicado = async (destinatario, motivoAutomatico, horasLimite = 24) => {
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() - horasLimite);
    const avisoExistente = await Aviso_1.default.findOne({
        destinatarios: destinatario,
        tipo: 'automatico',
        motivoAutomatico: motivoAutomatico,
        fecha: { $gte: fechaLimite }
    });
    return !!avisoExistente;
};
// Función para crear aviso de vencimiento
const crearAvisoVencimiento = async (alumno) => {
    const hoy = new Date();
    const termino = new Date(alumno.fechaTerminoPlan);
    const diff = Math.ceil((termino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    let titulo, mensaje, motivoAutomatico;
    if (diff === 1) {
        titulo = "Tu plan vence mañana";
        mensaje = `Hola ${alumno.nombre}, tu plan ${alumno.plan} vence mañana. Te recomendamos renovar para evitar interrupciones en tu entrenamiento.`;
        motivoAutomatico = "vencimiento_plan_1_dia";
    }
    else if (diff <= 3) {
        titulo = `Tu plan vence en ${diff} días`;
        mensaje = `Hola ${alumno.nombre}, tu plan ${alumno.plan} vence en ${diff} días. Te recomendamos renovar pronto para continuar con tu entrenamiento.`;
        motivoAutomatico = `vencimiento_plan_${diff}_dias`;
    }
    else { // diff <= 7
        titulo = `Tu plan vence en ${diff} días`;
        mensaje = `Hola ${alumno.nombre}, tu plan ${alumno.plan} vence en ${diff} días. Considera renovar para mantener tu rutina de entrenamiento.`;
        motivoAutomatico = `vencimiento_plan_${diff}_dias`;
    }
    // Verificar si ya existe un aviso duplicado
    const esDuplicado = await verificarAvisoDuplicado(alumno.rut, motivoAutomatico);
    if (esDuplicado) {
        console.log(`⚠️ Aviso duplicado evitado para ${alumno.nombre} (${motivoAutomatico})`);
        return null;
    }
    try {
        const aviso = new Aviso_1.default({
            titulo,
            mensaje,
            profesor: 'SISTEMA',
            destinatarios: [alumno.rut],
            tipo: 'automatico',
            motivoAutomatico
        });
        await aviso.save();
        console.log(`✅ Aviso automático enviado a ${alumno.nombre} (${diff} días restantes)`);
        return aviso;
    }
    catch (error) {
        console.error(`❌ Error enviando aviso a ${alumno.nombre}:`, error);
        return null;
    }
};
// Función principal para enviar avisos automáticos
const enviarAvisosAutomaticos = async () => {
    try {
        console.log('🔔 Iniciando verificación automática de planes próximos a vencer...');
        const hoy = new Date();
        const alumnos = await Alumno_1.default.find({
            fechaTerminoPlan: { $exists: true, $ne: null }
        });
        console.log(`📊 Verificando ${alumnos.length} alumnos con planes activos`);
        const alumnosParaAvisar = alumnos.filter(alumno => {
            if (!alumno.fechaTerminoPlan)
                return false;
            const termino = new Date(alumno.fechaTerminoPlan);
            const diff = Math.ceil((termino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
            return diff <= 7 && diff > 0; // Solo planes que vencen en 7 días o menos
        });
        console.log(`🔔 Encontrados ${alumnosParaAvisar.length} alumnos con planes próximos a vencer`);
        if (alumnosParaAvisar.length === 0) {
            console.log('✅ No hay planes próximos a vencer en los próximos 7 días');
            return { enviados: 0, errores: 0 };
        }
        let enviados = 0;
        let errores = 0;
        for (const alumno of alumnosParaAvisar) {
            try {
                const aviso = await crearAvisoVencimiento(alumno);
                if (aviso) {
                    enviados++;
                }
            }
            catch (error) {
                console.error(`❌ Error procesando aviso para ${alumno.nombre}:`, error);
                errores++;
            }
        }
        console.log(`🎉 Verificación completada: ${enviados} avisos enviados, ${errores} errores`);
        return { enviados, errores };
    }
    catch (error) {
        console.error('❌ Error en verificación automática de avisos:', error);
        throw error;
    }
};
exports.enviarAvisosAutomaticos = enviarAvisosAutomaticos;
// Función para verificar planes vencidos (opcional)
const verificarPlanesVencidos = async () => {
    try {
        console.log('🔍 Verificando planes vencidos...');
        const hoy = new Date();
        const alumnosVencidos = await Alumno_1.default.find({
            fechaTerminoPlan: { $lt: hoy }
        });
        console.log(`📊 Encontrados ${alumnosVencidos.length} planes vencidos`);
        // Aquí podrías agregar lógica adicional para manejar planes vencidos
        // Por ejemplo, desactivar acceso, enviar notificaciones especiales, etc.
        return alumnosVencidos.length;
    }
    catch (error) {
        console.error('❌ Error verificando planes vencidos:', error);
        throw error;
    }
};
exports.verificarPlanesVencidos = verificarPlanesVencidos;
