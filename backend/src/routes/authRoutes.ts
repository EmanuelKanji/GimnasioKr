import express from 'express';
import { loginAdmin } from '../controllers/adminController';
import { loginAlumno } from '../controllers/alumnoController';
import { loginProfesor } from '../controllers/profesorController';
import { loginUser } from '../controllers/authController';
import { validate, schemas } from '../middleware/validation';

const router = express.Router();

// Ruta GET para verificar que el endpoint funciona
router.get('/login', (req, res) => {
  res.json({ 
    message: 'Endpoint de login disponible', 
    method: 'POST requerido',
    endpoint: '/api/auth/login'
  });
});

// Ruta unificada para login (recomendada)
router.post('/login', validate(schemas.login), loginUser);

// Rutas específicas por rol (mantener compatibilidad)
router.post('/login/admin', loginAdmin);
router.post('/login/alumno', loginAlumno);
router.post('/login/profesor', loginProfesor);

export default router;
