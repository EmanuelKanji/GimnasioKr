import { Router } from 'express';
import { createPlan, getPlans, getPlan, updatePlan, deletePlan } from '../controllers/planController';
import { validatePlan } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/', getPlans);
router.get('/:id', getPlan);

// Rutas protegidas para administradores
router.post('/', authenticate, authorize('admin'), validatePlan, createPlan);
router.put('/:id', authenticate, authorize('admin'), validatePlan, updatePlan);
router.delete('/:id', authenticate, authorize('admin'), deletePlan);

export default router;