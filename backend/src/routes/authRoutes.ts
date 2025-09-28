import express from 'express';
import { loginAdmin } from '../controllers/adminController';
import { loginAlumno } from '../controllers/alumnoController';
import { loginProfesor } from '../controllers/profesorController';
import { loginUser } from '../controllers/authController';

const router = express.Router();

// Ruta unificada para login (recomendada)
router.post('/login', loginUser);

// Rutas específicas por rol (mantener compatibilidad)
router.post('/login/admin', loginAdmin);
router.post('/login/alumno', loginAlumno);
router.post('/login/profesor', loginProfesor);

export default router;
