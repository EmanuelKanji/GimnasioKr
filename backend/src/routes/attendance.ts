import { Router } from 'express';
import { 
  registerAttendanceByQR, 
  registerAttendanceByRUT, 
  getAttendanceHistory,
  getAttendanceStats 
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Rutas públicas para registro de asistencia
router.post('/qr', registerAttendanceByQR);
router.post('/rut', registerAttendanceByRUT);

// Rutas protegidas
router.get('/history/:userId', authenticate, getAttendanceHistory);
router.get('/history', authenticate, getAttendanceHistory);
router.get('/stats/:userId', authenticate, getAttendanceStats);
router.get('/stats', authenticate, getAttendanceStats);

export default router;