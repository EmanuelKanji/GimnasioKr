import asistenciaRoutes from './routes/asistenciaRoutes';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// ========================
// Configuración principal
// ========================

// 1. Variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Importaciones de rutas y utilidades
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import alumnoRoutes from './routes/alumnoRoutes';
import { authenticateToken, requireRole } from './middleware/auth';
import { connectDB } from './config/db';
import User from './models/User';
import planRoutes from './routes/planRoutes';
import avisoRoutes from './routes/avisoRoutes';
import profesorRoutes from './routes/profesorRoutes';


// 3. Inicialización de Express y middlewares
const app = express();
app.use(express.json());
app.use(helmet());
// Limitar a 100 peticiones por IP cada 15 minutos
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
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

app.get('/', (_req, res) => {
  res.send('API Gym Backend funcionando');
});
// Rutas de autenticación
app.use('/api/auth', authRoutes);

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

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
    await connectDB();
    await ensureAdminUser();
  // 🚀 Backend corriendo en http://localhost:${PORT}
  // ✅ Conexión a MongoDB exitosa
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err);
  }
});
