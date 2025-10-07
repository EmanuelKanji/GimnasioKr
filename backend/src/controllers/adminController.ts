
import { Request, Response } from 'express';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import User from '../models/User';

export const loginAdmin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  try {
    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario admin
    const user = await User.findOne({ username, role: 'admin' });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que JWT_SECRET esté definida
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definida en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET as Secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '24h' }
    );

    return res.status(200).json({ 
      message: 'Login admin exitoso', 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login admin:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
