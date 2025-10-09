import { Router } from 'express';
import { 
  crearProfesor,
  obtenerPerfilProfesor, 
  actualizarPerfilProfesor,
  agregarMiAlumno,
  eliminarMiAlumno,
  obtenerMisAlumnos,
  obtenerEstadisticasProfesor
} from '../controllers/profesorController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Crear profesor (solo admin)
router.post('/', authenticateToken, requireRole(['admin']), validate(schemas.crearProfesor), crearProfesor);

// Obtener perfil del profesor
router.get('/me', authenticateToken, requireRole(['profesor']), obtenerPerfilProfesor);

// Actualizar perfil del profesor
router.post('/me', authenticateToken, requireRole(['profesor']), validate(schemas.actualizarPerfilProfesor), actualizarPerfilProfesor);

// Gestión de "mis alumnos"
router.get('/mis-alumnos', authenticateToken, requireRole(['profesor']), obtenerMisAlumnos);
router.post('/mis-alumnos/agregar', authenticateToken, requireRole(['profesor']), agregarMiAlumno);
router.post('/mis-alumnos/eliminar', authenticateToken, requireRole(['profesor']), eliminarMiAlumno);

// Estadísticas del profesor
router.get('/estadisticas', authenticateToken, requireRole(['profesor']), obtenerEstadisticasProfesor);

export default router;
