import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Alumno from '../models/Alumno';

// Obtener plan del alumno por RUT
export const obtenerPlanAlumno = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
      res.json({ plan: {
        nombre: alumno.plan,
        descripcion: 'Acceso ilimitado a clases grupales y uso de gimnasio.',
        fechaInicio: alumno.fechaInicioPlan,
        fechaFin: alumno.fechaTerminoPlan,
        estadoPago: 'pagado',
        monto: alumno.monto
      }});
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener plan de alumno', error });
  }
};

// Obtener asistencia del alumno por RUT
export const obtenerAsistenciaAlumno = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    const limpiarRut = (r: string) => r.replace(/\.|-/g, '').toUpperCase();
    const alumnos = await Alumno.find();
    const alumno = alumnos.find((a: any) => limpiarRut(a.rut) === limpiarRut(rut));
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json({ diasAsistidos: alumno.asistencias || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asistencia de alumno', error });
  }
};

// Obtener avisos del alumno por RUT
export const obtenerAvisosAlumno = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json({ avisos: alumno.avisos || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener avisos de alumno', error });
  }
};

// Obtener perfil de alumno por RUT (extraído del token)
export const obtenerPerfilAlumno = async (req: Request, res: Response) => {
  try {
  // El rut ya está en req.user gracias al middleware
  const rut = (req as any).user?.rut;
  if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
  const alumno = await Alumno.findOne({ rut });
  if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
  res.json({ perfil: alumno });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil de alumno', error });
  }
};

// Obtener lista de alumnos
export const obtenerAlumnos = async (_req: Request, res: Response) => {
  try {
    const alumnos = await Alumno.find();
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alumnos', error });
  }
};

// Login de alumno
export const loginAlumno = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar usuario alumno
    const user = await User.findOne({ username, role: 'alumno' });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

  // Buscar rut del alumno usando el campo rut del usuario
  const alumno = await Alumno.findOne({ rut: user.rut });
    // Generar JWT con rut
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        rut: alumno ? alumno.rut : undefined
      },
      (process.env.JWT_SECRET as Secret) || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '24h' }
    );

    return res.status(200).json({ 
      message: 'Login alumno exitoso', 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login alumno:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear alumno
export const crearAlumno = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      rut,
      direccion,
      fechaNacimiento,
      email,
      telefono,
      plan,
      fechaInicioPlan,
      duracion,
      monto,
      password
    } = req.body;
    if (!nombre || !rut || !direccion || !fechaNacimiento || !email || !telefono || !plan || !fechaInicioPlan || !duracion || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    // Verificar si el usuario ya existe
    const userExistente = await User.findOne({ username: email });
    if (userExistente) {
      return res.status(409).json({ message: 'El usuario ya está registrado.' });
    }
    // Verificar si el alumno ya existe
    const alumnoExistente = await Alumno.findOne({ rut });
    if (alumnoExistente) {
      return res.status(409).json({ message: 'El alumno ya está inscrito.' });
    }
    // Crear usuario para login
    const nuevoUsuario = new User({ username: email, password, role: 'alumno', rut });
    await nuevoUsuario.save();
    // Calcular fecha de término según duración
    const inicio = new Date(fechaInicioPlan);
    let termino = new Date(inicio);
    if (duracion === 'mensual') {
      termino.setMonth(termino.getMonth() + 1);
    } else if (duracion === 'trimestral') {
      termino.setMonth(termino.getMonth() + 3);
    } else if (duracion === 'anual') {
      termino.setFullYear(termino.getFullYear() + 1);
    }
    // Crear perfil de alumno
    const nuevoAlumno = new Alumno({
      nombre,
      rut,
      direccion,
      fechaNacimiento,
      email,
      telefono,
      plan,
      fechaInicioPlan,
      fechaTerminoPlan: termino.toISOString(),
      duracion,
      monto,
      asistencias: [],
      avisos: []
    });
    await nuevoAlumno.save();
    return res.status(201).json({ message: 'Alumno y usuario creados exitosamente.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al inscribir alumno.', error });
  }
};
