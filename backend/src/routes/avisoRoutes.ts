import { Router } from 'express';
import { crearAviso, obtenerAvisosProfesor, obtenerAvisosAlumno, verificarPlanesVencimiento } from '../controllers/avisoController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Crear aviso (profesor y admin)
router.post('/', authenticateToken, requireRole(['profesor', 'admin']), crearAviso);

// Obtener avisos enviados por el profesor (profesor y admin)
router.get('/profesor', authenticateToken, requireRole(['profesor', 'admin']), obtenerAvisosProfesor);

// Obtener avisos para el alumno
router.get('/alumno', authenticateToken, requireRole(['alumno']), obtenerAvisosAlumno);

// Verificar planes próximos a vencer (solo admin)
router.post('/verificar-planes', authenticateToken, requireRole(['admin']), verificarPlanesVencimiento);

export default router;
