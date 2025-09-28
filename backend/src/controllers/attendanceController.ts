import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import User from '../models/User';
import { parseQRCode } from '../utils/qrGenerator';
import { AuthenticatedRequest } from '../middleware/auth';

export const registerAttendanceByQR = async (req: Request, res: Response) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'Código QR requerido' });
    }

    // Parsear datos del QR
    const qrInfo = parseQRCode(qrData);
    
    // Verificar que el usuario existe
    const user = await User.findById(qrInfo.userId);
    if (!user || !user.activo) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }

    // Verificar si ya registró asistencia hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      usuarioId: user._id,
      fecha: today
    });

    if (existingAttendance) {
      // Si no tiene hora de salida, registrarla
      if (!existingAttendance.horaSalida) {
        existingAttendance.horaSalida = new Date();
        await existingAttendance.save();

        return res.json({
          message: 'Salida registrada exitosamente',
          attendance: existingAttendance,
          user: { nombre: user.nombre, apellido: user.apellido }
        });
      } else {
        return res.status(400).json({ 
          message: 'Ya se registró entrada y salida para hoy' 
        });
      }
    }

    // Crear nueva asistencia
    const attendance = new Attendance({
      usuarioId: user._id,
      fecha: today,
      horaEntrada: new Date(),
      metodoRegistro: 'qr'
    });

    await attendance.save();

    res.json({
      message: 'Asistencia registrada exitosamente',
      attendance,
      user: { nombre: user.nombre, apellido: user.apellido }
    });
  } catch (error) {
    console.error('Error registrando asistencia por QR:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const registerAttendanceByRUT = async (req: Request, res: Response) => {
  try {
    const { rut } = req.body;

    if (!rut) {
      return res.status(400).json({ message: 'RUT requerido' });
    }

    // Buscar usuario por RUT
    const user = await User.findOne({ rut, activo: true });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si ya registró asistencia hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      usuarioId: user._id,
      fecha: today
    });

    if (existingAttendance) {
      // Si no tiene hora de salida, registrarla
      if (!existingAttendance.horaSalida) {
        existingAttendance.horaSalida = new Date();
        await existingAttendance.save();

        return res.json({
          message: 'Salida registrada exitosamente',
          attendance: existingAttendance,
          user: { nombre: user.nombre, apellido: user.apellido }
        });
      } else {
        return res.status(400).json({ 
          message: 'Ya se registró entrada y salida para hoy' 
        });
      }
    }

    // Crear nueva asistencia
    const attendance = new Attendance({
      usuarioId: user._id,
      fecha: today,
      horaEntrada: new Date(),
      metodoRegistro: 'rut'
    });

    await attendance.save();

    res.json({
      message: 'Asistencia registrada exitosamente',
      attendance,
      user: { nombre: user.nombre, apellido: user.apellido }
    });
  } catch (error) {
    console.error('Error registrando asistencia por RUT:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAttendanceHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const userId = req.params.userId || req.user?.id;

    // Verificar permisos
    if (req.user?.rol !== 'admin' && req.user?.rol !== 'profesor' && req.user?.id !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
    }

    const query: any = { usuarioId: userId };

    // Filtros de fecha
    if (startDate || endDate) {
      query.fecha = {};
      if (startDate) query.fecha.$gte = new Date(startDate as string);
      if (endDate) query.fecha.$lte = new Date(endDate as string);
    }

    const attendances = await Attendance.find(query)
      .populate('usuarioId', 'nombre apellido rut')
      .sort({ fecha: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      attendances,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial de asistencia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAttendanceStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.id;

    // Verificar permisos
    if (req.user?.rol !== 'admin' && req.user?.rol !== 'profesor' && req.user?.id !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [monthlyAttendance, weeklyAttendance, totalAttendance] = await Promise.all([
      Attendance.countDocuments({
        usuarioId: userId,
        fecha: { $gte: startOfMonth }
      }),
      Attendance.countDocuments({
        usuarioId: userId,
        fecha: { $gte: startOfWeek }
      }),
      Attendance.countDocuments({ usuarioId: userId })
    ]);

    res.json({
      stats: {
        totalAttendance,
        monthlyAttendance,
        weeklyAttendance
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de asistencia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};