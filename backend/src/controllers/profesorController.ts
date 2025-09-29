import Profesor from '../models/Profesor';
import { AuthRequest } from '../middleware/auth';
import { Response, Request } from 'express';

export const obtenerPerfilProfesor = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    const profesor = await Profesor.findOne({ rut });
    if (!profesor) return res.status(404).json({ error: 'Profesor no encontrado' });
    res.json(profesor);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const actualizarPerfilProfesor = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    const update = req.body;
    const profesor = await Profesor.findOneAndUpdate({ rut }, update, { new: true, upsert: true });
    res.json(profesor);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';

export const loginProfesor = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }
  const user = await User.findOne({ username, role: 'profesor' });
  console.log('Usuario encontrado en login:', user);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    const rut = userObj.rut;
    console.log('Login profesor - userObj:', userObj); // Depuración
    const token = jwt.sign(
      { id: userObj._id, username: userObj.username, role: userObj.role, rut },
      (process.env.JWT_SECRET as Secret) || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '24h' }
    );
    return res.status(200).json({ 
      message: 'Login profesor exitoso', 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        rut: user.rut
      }
    });
  } catch (error) {
    console.error('Error en login profesor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
