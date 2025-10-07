import { Router } from 'express';
import { obtenerPlanes, crearPlan, eliminarPlan } from '../controllers/planController';
import { validate, schemas } from '../middleware/validation';

const router = Router();

router.get('/', obtenerPlanes);
router.post('/', validate(schemas.createPlan), crearPlan);
router.delete('/:id', eliminarPlan);

export default router;
