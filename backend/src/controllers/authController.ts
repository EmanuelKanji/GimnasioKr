import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { generateQRCode } from '../utils/qrGenerator';

export const register = async (req: Request, res: Response) => {
  try {
    const { rut, nombre, apellido, email, password, telefono, fechaNacimiento, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { rut }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Ya existe un usuario con este email o RUT'
      });
    }

    // Crear nuevo usuario
    const user = new User({
      rut,
      nombre,
      apellido,
      email,
      password,
      telefono,
      fechaNacimiento,
      rol: rol || 'alumno'
    });

    await user.save();

    // Generar código QR para el usuario
    const qrCode = await generateQRCode(user._id?.toString() || '', user.rut);
    user.qrCode = qrCode;
    await user.save();

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        rut: user.rut,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        qrCode: user.qrCode
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        rut: user.rut,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        qrCode: user.qrCode
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('planId');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { nombre, apellido, telefono, fechaNacimiento } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nombre, apellido, telefono, fechaNacimiento },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};