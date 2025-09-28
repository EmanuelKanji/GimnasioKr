"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asistenciaRoutes_1 = __importDefault(require("./routes/asistenciaRoutes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
const User_1 = __importDefault(require("./models/User"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
// 3. Inicialización de Express y middlewares
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
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
    const admin = await User_1.default.findOne({ username: 'admin', role: 'admin' });
    if (!admin) {
        await User_1.default.create({ username: 'admin', password: 'admin123', role: 'admin' });
        console.log('Usuario admin creado por defecto');
    }
}
app.listen(PORT, async () => {
    try {
        await (0, db_1.connectDB)();
        await ensureAdminUser();
        console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
        console.log('✅ Conexión a MongoDB exitosa');
    }
    catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err);
    }
});
