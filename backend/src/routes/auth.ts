import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { validateUserRegistration, validateLogin } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;