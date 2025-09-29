import { Router } from 'express';
import { obtenerPerfilProfesor, actualizarPerfilProfesor } from '../controllers/profesorController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Obtener perfil del profesor
router.get('/me', authenticateToken, requireRole(['profesor']), obtenerPerfilProfesor);

// Actualizar perfil del profesor
router.post('/me', authenticateToken, requireRole(['profesor']), actualizarPerfilProfesor);

export default router;
