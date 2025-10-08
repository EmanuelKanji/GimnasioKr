import { Router } from 'express';
import { obtenerPlanes, crearPlan, eliminarPlan } from '../controllers/planController';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Solo admin puede gestionar planes
router.get('/', requireRole(['admin']), obtenerPlanes);
router.post('/', requireRole(['admin']), validate(schemas.createPlan), crearPlan);
router.delete('/:id', requireRole(['admin']), eliminarPlan);

export default router;
