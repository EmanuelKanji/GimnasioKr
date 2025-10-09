import asistenciaRoutes from './routes/asistenciaRoutes';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// ========================
// Configuración principal
// ========================

// 1. Variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 3. Importaciones de rutas y utilidades
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import authUserRoutes from './routes/authUserRoutes';
import alumnoRoutes from './routes/alumnoRoutes';
import { authenticateToken, requireRole } from './middleware/auth';
import { connectDB } from './config/db';
import User from './models/User';
import planRoutes from './routes/planRoutes';
import avisoRoutes from './routes/avisoRoutes';
import profesorRoutes from './routes/profesorRoutes';
import { healthCheck, readinessCheck } from './controllers/healthController';
import { requestLogger, errorLogger, errorHandler } from './middleware/logging';
import logger from './config/logger';


// 4. Inicialización de Express y middlewares
export const app = express();

// Trust proxy para obtener IP real en producción
app.set('trust proxy', 1);

// Middlewares de seguridad y logging
app.use(helmet({
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 50 : 100, // Más estricto en producción
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging de requests
app.use(requestLogger);

// Body parsing con límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Configuración de CORS mejorada
const allowedOrigins = [
  'https://kraccess.netlify.app',
  'https://gimnasiokr.onrender.com',
  'https://kraccess.cl',
  'https://www.kraccess.cl',
  'http://kraccess.cl', // Por si acaso usas HTTP temporalmente
  'http://www.kraccess.cl',
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
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
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
    } else {
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

app.use(cors(corsOptions));

// Middleware adicional para manejar preflight requests
app.use((req, res, next) => {
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
    } else {
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
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);

app.get('/', (_req, res) => {
  res.json({ 
    message: 'API Gym Backend funcionando',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas para usuarios autenticados (cualquier rol)
app.use('/api/users', authUserRoutes);

// Rutas protegidas - requieren autenticación
app.use('/api/usuarios', authenticateToken, requireRole(['admin']), userRoutes);
app.use('/api/alumnos', authenticateToken, alumnoRoutes);
app.use('/api/planes', authenticateToken, requireRole(['admin']), planRoutes);
app.use('/api/asistencias', authenticateToken, asistenciaRoutes);
app.use('/api/avisos', avisoRoutes);
app.use('/api/profesor', profesorRoutes);

// ========================
// Manejo de errores global
// ========================

// Middleware para logging de errores
app.use(errorLogger);

// Middleware para manejo de errores
app.use(errorHandler);

// Ruta 404 - debe ir al final de todas las rutas
app.use((req, res) => {
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

app.listen(PORT, async () => {
  try {
    await connectDB();
    await ensureAdminUser();
    
    logger.info('🚀 Servidor iniciado', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
    
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
    console.log(`✅ Conexión a MongoDB exitosa`);
  } catch (err) {
    logger.error('❌ Error al iniciar servidor', { error: err });
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  }
});
