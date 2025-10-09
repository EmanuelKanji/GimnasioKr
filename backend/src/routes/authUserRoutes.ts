import express from 'express';
import { cambiarPassword } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = express.Router();

// Cambiar contraseña del usuario autenticado (cualquier rol)
router.put('/cambiar-password', authenticateToken, validate(schemas.cambiarPassword), cambiarPassword);

export default router;
