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
// Permitir solo el origen del frontend en producción
const allowedOrigins = [
  'http://localhost:3000',
  'https://kraccess.netlify.app',
  'https://gimnasiokr.onrender.com'
];
if (process.env.CORS_ORIGIN) {
  // Permitir múltiples orígenes separados por coma en la variable de entorno
  process.env.CORS_ORIGIN.split(',').forEach(origin => {
    if (origin && !allowedOrigins.includes(origin.trim())) {
      allowedOrigins.push(origin.trim());
    }
  });
}
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

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
