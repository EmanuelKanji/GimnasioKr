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
