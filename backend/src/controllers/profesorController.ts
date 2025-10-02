import Profesor from '../models/Profesor';
import Alumno from '../models/Alumno';
import Asistencia from '../models/Asistencia';
import Aviso from '../models/Aviso';
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

// Agregar alumno a "mis alumnos"
export const agregarMiAlumno = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    const { rutAlumno } = req.body;
    
    // Verificar que el alumno existe
    const alumno = await Alumno.findOne({ rut: rutAlumno });
    if (!alumno) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    
    // Agregar alumno a la lista si no está ya agregado
    const profesor = await Profesor.findOneAndUpdate(
      { rut, misAlumnos: { $ne: rutAlumno } },
      { $push: { misAlumnos: rutAlumno } },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Alumno agregado exitosamente', profesor });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar alumno' });
  }
};

// Eliminar alumno de "mis alumnos"
export const eliminarMiAlumno = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    const { rutAlumno } = req.body;
    
    const profesor = await Profesor.findOneAndUpdate(
      { rut },
      { $pull: { misAlumnos: rutAlumno } },
      { new: true }
    );
    
    if (!profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }
    
    res.json({ message: 'Alumno eliminado exitosamente', profesor });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
};

// Obtener "mis alumnos" con detalles completos
export const obtenerMisAlumnos = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    const profesor = await Profesor.findOne({ rut });
    
    if (!profesor || !profesor.misAlumnos) {
      return res.json([]);
    }
    
    // Obtener detalles completos de mis alumnos
    const alumnos = await Alumno.find({ rut: { $in: profesor.misAlumnos } });
    res.json(alumnos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mis alumnos' });
  }
};

// Obtener estadísticas del profesor
export const obtenerEstadisticasProfesor = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    const profesor = await Profesor.findOne({ rut });
    
    if (!profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }
    
    // Obtener datos de la semana actual
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo de esta semana
    inicioSemana.setHours(0, 0, 0, 0);
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Sábado de esta semana
    finSemana.setHours(23, 59, 59, 999);
    
    // Obtener asistencias de la semana de todos los alumnos (para estadísticas generales)
    const asistenciasSemana = await Asistencia.find({
      fecha: { $gte: inicioSemana, $lte: finSemana }
    });
    
    // Agrupar asistencias por día
    const asistenciasPorDia = [];
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      
      const asistenciasDia = asistenciasSemana.filter(a => {
        const fechaAsistencia = new Date(a.fecha);
        return fechaAsistencia.toDateString() === dia.toDateString();
      });
      
      asistenciasPorDia.push({
        dia: diasSemana[i],
        asistencia: asistenciasDia.length,
        fecha: dia.toISOString().split('T')[0]
      });
    }
    
    // Estadísticas de alumnos
    const totalAlumnos = await Alumno.countDocuments();
    const alumnosActivos = await Alumno.countDocuments({
      fechaFinPlan: { $gte: new Date() }
    });
    
    // Contar alumnos nuevos (agregados en la última semana)
    const alumnosNuevos = await Alumno.countDocuments({
      createdAt: { $gte: inicioSemana }
    });
    
    // Avisos del profesor (últimos 5)
    const avisos = await Aviso.find({ profesor: rut })
      .sort({ fecha: -1 })
      .limit(5)
      .select('titulo fecha leidoPor destinatarios');
    
    // Calcular estadísticas de avisos
    const avisosConEstadisticas = avisos.map(aviso => ({
      id: aviso._id,
      titulo: aviso.titulo,
      fecha: aviso.fecha,
      leido: aviso.leidoPor?.length > 0,
      totalDestinatarios: aviso.destinatarios?.length || 0,
      totalLeidos: aviso.leidoPor?.length || 0
    }));
    
    // Estadísticas de mis alumnos
    const misAlumnosDetalles = await Alumno.find({ 
      rut: { $in: profesor.misAlumnos || [] } 
    });
    
    const estadisticas = {
      asistenciasSemana: asistenciasPorDia,
      alumnos: {
        total: totalAlumnos || 0,
        activos: alumnosActivos || 0,
        nuevos: alumnosNuevos || 0,
        misAlumnos: misAlumnosDetalles.length || 0
      },
      avisos: avisosConEstadisticas || [],
      resumen: {
        totalAsistenciasSemana: asistenciasSemana.length || 0,
        promedioAsistenciasDiarias: Math.round((asistenciasSemana.length || 0) / 7),
        avisosEnviados: avisos.length || 0,
        fechaActualizacion: new Date()
      }
    };
    
    res.json(estadisticas);
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas del profesor' });
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
