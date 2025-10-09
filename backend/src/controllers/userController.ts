import { Request, Response } from 'express';
import User from '../models/User';

export const createUser = async (req: Request, res: Response) => {
  const { username, password, role, rut } = req.body;
  if (!username || !password || !role || !rut) {
    return res.status(400).json({ error: 'Todos los campos son requeridos (correo, rut, password, rol)' });
  }
  if (!['alumno', 'profesor'].includes(role)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }
    const user = new User({ username, password, role, rut });
    await user.save();
    return res.status(201).json({ message: 'Usuario creado correctamente', user: { username, rut, role } });
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Cambiar contraseña del usuario autenticado
export const cambiarPassword = async (req: Request, res: Response) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const userId = (req as any).user?.id;

    // Validar campos requeridos
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ 
        error: 'La contraseña actual y la nueva contraseña son requeridas' 
      });
    }

    // Validar longitud de contraseña
    if (passwordNueva.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Buscar el usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(passwordActual);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Actualizar contraseña
    user.password = passwordNueva;
    await user.save();

    return res.status(200).json({ 
      message: 'Contraseña cambiada exitosamente' 
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};