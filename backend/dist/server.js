"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const asistenciaRoutes_1 = __importDefault(require("./routes/asistenciaRoutes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ========================
// Configuración principal
// ========================
// 1. Variables de entorno
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// 2. Crear directorio de logs si no existe
const logsDir = path_1.default.join(__dirname, '../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// 3. Importaciones de rutas y utilidades
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const alumnoRoutes_1 = __importDefault(require("./routes/alumnoRoutes"));
const auth_1 = require("./middleware/auth");
const db_1 = require("./config/db");
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const avisoRoutes_1 = __importDefault(require("./routes/avisoRoutes"));
const profesorRoutes_1 = __importDefault(require("./routes/profesorRoutes"));
const healthController_1 = require("./controllers/healthController");
const logging_1 = require("./middleware/logging");
const logger_1 = __importDefault(require("./config/logger"));
// 4. Inicialización de Express y middlewares
exports.app = (0, express_1.default)();
// Trust proxy para obtener IP real en producción
exports.app.set('trust proxy', 1);
// Middlewares de seguridad y logging
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// Rate limiting más estricto para producción
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 50 : 100, // Más estricto en producción
    message: {
        error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.app.use(limiter);
// Logging de requests
exports.app.use(logging_1.requestLogger);
// Body parsing con límite de tamaño
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Configuración de CORS mejorada
const allowedOrigins = [
    'https://kraccess.netlify.app',
    'https://gimnasiokr.onrender.com', // Agregar tu dominio de Netlify si es diferente
];
// Agregar orígenes desde variables de entorno
if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(',').forEach(origin => {
        const cleanOrigin = origin.trim();
        if (cleanOrigin && !allowedOrigins.includes(cleanOrigin)) {
            allowedOrigins.push(cleanOrigin);
        }
    });
}
// Configuración CORS más permisiva para desarrollo
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (ej: Postman, mobile apps)
        if (!origin) {
            return callback(null, true);
        }
        // En desarrollo, permitir cualquier origen local
        if (process.env.NODE_ENV === 'development') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.')) {
                return callback(null, true);
            }
        }
        // En producción, verificar lista de orígenes permitidos
        if (allowedOrigins.includes(origin)) {
            console.log(`✅ CORS permitido para origen: ${origin}`);
            callback(null, true);
        }
        else {
            console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
            console.log(`📋 Orígenes permitidos: ${allowedOrigins.join(', ')}`);
            callback(new Error(`Origen no permitido por CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false
};
exports.app.use((0, cors_1.default)(corsOptions));
// Middleware adicional para manejar preflight requests
exports.app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Log de la petición para debugging
    console.log(`🌐 Petición ${req.method} desde: ${origin} a ${req.path}`);
    if (req.method === 'OPTIONS') {
        // Verificar si el origen está permitido
        if (!origin || allowedOrigins.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin || '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Max-Age', '86400'); // 24 horas
            res.header('Access-Control-Expose-Headers', 'Authorization');
            console.log(`✅ Preflight permitido para: ${origin}`);
            return res.status(200).end();
        }
        else {
            console.warn(`🚫 Preflight bloqueado para: ${origin}`);
            return res.status(403).json({ error: 'CORS: Origen no permitido' });
        }
    }
    // Para peticiones no-OPTIONS, agregar headers CORS
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', 'Authorization');
    }
    next();
});
// ========================
// Rutas
// ========================
// Health checks (sin autenticación)
exports.app.get('/health', healthController_1.healthCheck);
exports.app.get('/ready', healthController_1.readinessCheck);
exports.app.get('/', (_req, res) => {
    res.json({
        message: 'API Gym Backend funcionando',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});
// Rutas de autenticación
exports.app.use('/api/auth', authRoutes_1.default);
// Rutas protegidas - requieren autenticación
exports.app.use('/api/usuarios', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), userRoutes_1.default);
exports.app.use('/api/alumnos', auth_1.authenticateToken, alumnoRoutes_1.default);
exports.app.use('/api/planes', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), planRoutes_1.default);
exports.app.use('/api/asistencias', auth_1.authenticateToken, asistenciaRoutes_1.default);
exports.app.use('/api/avisos', avisoRoutes_1.default);
exports.app.use('/api/profesor', profesorRoutes_1.default);
// ========================
// Manejo de errores global
// ========================
// Middleware para logging de errores
exports.app.use(logging_1.errorLogger);
// Middleware para manejo de errores
exports.app.use(logging_1.errorHandler);
// Ruta 404 - debe ir al final de todas las rutas
exports.app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
    });
});
// ========================
// Inicialización y conexión
// ========================
const PORT = process.env.PORT || 4000;
async function ensureAdminUser() {
    // Eliminada la creación automática del usuario admin por defecto
}
exports.app.listen(PORT, async () => {
    try {
        await (0, db_1.connectDB)();
        await ensureAdminUser();
        logger_1.default.info('🚀 Servidor iniciado', {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0'
        });
        console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
        console.log(`✅ Conexión a MongoDB exitosa`);
    }
    catch (err) {
        logger_1.default.error('❌ Error al iniciar servidor', { error: err });
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1);
    }
});
