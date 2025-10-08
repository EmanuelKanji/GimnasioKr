import { Router } from 'express';
import { registrarAsistencia, obtenerHistorialAsistencia } from '../controllers/asistenciaController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Registrar asistencia (solo admin y profesor)
router.post('/', requireRole(['admin', 'profesor']), registrarAsistencia);

// Obtener historial de asistencia (solo admin)
router.get('/', requireRole(['admin']), obtenerHistorialAsistencia);

export default router;
