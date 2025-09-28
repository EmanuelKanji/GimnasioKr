import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Alumno from '../models/Alumno';

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  try {
    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario por username (sin filtrar por rol)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Si es alumno, buscar su RUT
    let rut = undefined;
    if (user.role === 'alumno') {
      // Buscar el alumno por el email del usuario
      const alumno = await Alumno.findOne({ email: user.username });
      rut = alumno ? alumno.rut : undefined;
      console.log('RUT encontrado para alumno:', rut); // Debug
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        rut: rut
      },
      (process.env.JWT_SECRET as Secret) || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '24h' }
    );

    return res.status(200).json({ 
      message: `Login ${user.role} exitoso`, 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

