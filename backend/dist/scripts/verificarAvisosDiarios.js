"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../config/db");
const avisoService_1 = require("../services/avisoService");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar variables de entorno
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Función para ejecutar verificación de avisos
const ejecutarVerificacion = async () => {
    try {
        console.log('🕐 Ejecutando verificación diaria de avisos...');
        console.log(`📅 Fecha: ${new Date().toLocaleString('es-CL')}`);
        // Conectar a la base de datos
        await (0, db_1.connectDB)();
        console.log('🔗 Conectado a la base de datos');
        // Enviar avisos automáticos
        const resultadoAvisos = await (0, avisoService_1.enviarAvisosAutomaticos)();
        console.log(`📊 Resultado avisos: ${resultadoAvisos.enviados} enviados, ${resultadoAvisos.errores} errores`);
        // Verificar planes vencidos (opcional)
        const planesVencidos = await (0, avisoService_1.verificarPlanesVencidos)();
        console.log(`📊 Planes vencidos encontrados: ${planesVencidos}`);
        console.log('✅ Verificación diaria completada exitosamente');
    }
    catch (error) {
        console.error('❌ Error en verificación diaria:', error);
    }
};
// Función para ejecutar una sola vez (para testing)
const ejecutarUnaVez = async () => {
    console.log('🧪 Ejecutando verificación una sola vez (modo testing)...');
    await ejecutarVerificacion();
    process.exit(0);
};
// Configurar tareas programadas
const configurarTareasProgramadas = () => {
    console.log('⏰ Configurando tareas programadas...');
    // Verificación diaria a las 9:00 AM
    node_cron_1.default.schedule('0 9 * * *', async () => {
        console.log('🌅 Iniciando verificación matutina...');
        await ejecutarVerificacion();
    }, {
        timezone: 'America/Santiago'
    });
    // Verificación adicional a las 6:00 PM (opcional)
    node_cron_1.default.schedule('0 18 * * *', async () => {
        console.log('🌆 Iniciando verificación vespertina...');
        await ejecutarVerificacion();
    }, {
        timezone: 'America/Santiago'
    });
    console.log('✅ Tareas programadas configuradas:');
    console.log('   - 9:00 AM: Verificación matutina');
    console.log('   - 6:00 PM: Verificación vespertina');
    console.log('   - Zona horaria: America/Santiago');
};
// Función principal
const main = async () => {
    const args = process.argv.slice(2);
    if (args.includes('--once') || args.includes('-o')) {
        // Ejecutar una sola vez
        await ejecutarUnaVez();
    }
    else if (args.includes('--schedule') || args.includes('-s')) {
        // Ejecutar con tareas programadas
        configurarTareasProgramadas();
        console.log('🔄 Servicio de avisos automáticos iniciado. Presiona Ctrl+C para detener.');
        // Mantener el proceso vivo
        process.on('SIGINT', () => {
            console.log('\n🛑 Deteniendo servicio de avisos automáticos...');
            process.exit(0);
        });
    }
    else {
        // Mostrar ayuda
        console.log('📋 Script de Verificación Diaria de Avisos');
        console.log('');
        console.log('Uso:');
        console.log('  npm run avisos:once     - Ejecutar verificación una sola vez');
        console.log('  npm run avisos:schedule - Iniciar servicio con tareas programadas');
        console.log('');
        console.log('Opciones:');
        console.log('  --once, -o      Ejecutar una sola vez');
        console.log('  --schedule, -s  Ejecutar con tareas programadas');
        console.log('');
        process.exit(0);
    }
};
// Ejecutar función principal
main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
