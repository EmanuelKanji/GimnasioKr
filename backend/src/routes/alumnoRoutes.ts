import { Router } from 'express';
import { 
  crearAlumno, 
  obtenerAlumnos, 
  obtenerPerfilAlumno, 
  obtenerPlanAlumno, 
  obtenerAsistenciaAlumno, 
  obtenerAvisosAlumno 
} from '../controllers/alumnoController';
import { requireRole } from '../middleware/auth';

const router = Router();

// Rutas para administradores - gestión de alumnos
router.post('/', requireRole(['admin']), crearAlumno);
router.get('/', requireRole(['admin']), obtenerAlumnos);

// Rutas para alumnos autenticados - sus propios datos
router.get('/me/perfil', requireRole(['alumno', 'admin']), obtenerPerfilAlumno);
router.get('/me/plan', requireRole(['alumno', 'admin']), obtenerPlanAlumno);
router.get('/me/asistencias', requireRole(['alumno', 'admin']), obtenerAsistenciaAlumno);
router.get('/me/avisos', requireRole(['alumno', 'admin']), obtenerAvisosAlumno);

export default router;
