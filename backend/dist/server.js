"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asistenciaRoutes_1 = __importDefault(require("./routes/asistenciaRoutes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// ========================
// Configuración principal
// ========================
// 1. Variables de entorno
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// 2. Importaciones de rutas y utilidades
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const alumnoRoutes_1 = __importDefault(require("./routes/alumnoRoutes"));
const auth_1 = require("./middleware/auth");
const db_1 = require("./config/db");
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const avisoRoutes_1 = __importDefault(require("./routes/avisoRoutes"));
const profesorRoutes_1 = __importDefault(require("./routes/profesorRoutes"));
// 3. Inicialización de Express y middlewares
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
// Limitar a 100 peticiones por IP cada 15 minutos
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
// Permitir solo el origen del frontend en producción
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
// ========================
// Rutas
// ========================
app.get('/', (_req, res) => {
    res.send('API Gym Backend funcionando');
});
// Rutas de autenticación
app.use('/api/auth', authRoutes_1.default);
// Rutas protegidas - requieren autenticación
app.use('/api/usuarios', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), userRoutes_1.default);
app.use('/api/alumnos', auth_1.authenticateToken, alumnoRoutes_1.default);
app.use('/api/planes', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), planRoutes_1.default);
app.use('/api/asistencias', auth_1.authenticateToken, asistenciaRoutes_1.default);
app.use('/api/avisos', avisoRoutes_1.default);
app.use('/api/profesor', profesorRoutes_1.default);
// ========================
// Manejo de errores global
// ========================
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
});
// ========================
// Inicialización y conexión
// ========================
const PORT = process.env.PORT || 4000;
async function ensureAdminUser() {
    // Eliminada la creación automática del usuario admin por defecto
}
app.listen(PORT, async () => {
    try {
        await (0, db_1.connectDB)();
        await ensureAdminUser();
        // 🚀 Backend corriendo en http://localhost:${PORT}
        // ✅ Conexión a MongoDB exitosa
    }
    catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err);
    }
});
