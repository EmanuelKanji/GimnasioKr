import express from 'express';
import { createUser } from '../controllers/userController';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

import { authenticateToken } from '../middleware/auth';
router.post('/', createUser);
// Obtener datos del usuario logueado
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
	try {
		if (!req.user) return res.status(401).json({ error: 'No autenticado' });
		res.json(req.user);
	} catch {
		res.status(500).json({ error: 'Error al obtener usuario' });
	}
});

export default router;
