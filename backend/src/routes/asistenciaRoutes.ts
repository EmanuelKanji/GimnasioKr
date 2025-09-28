import { Router } from 'express';
import { registrarAsistencia, obtenerHistorialAsistencia } from '../controllers/asistenciaController';

const router = Router();

router.post('/', registrarAsistencia);
router.get('/', obtenerHistorialAsistencia);

export default router;
