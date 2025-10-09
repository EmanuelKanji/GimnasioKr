import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Alumno from '../models/Alumno';
import Plan from '../models/Plan';

// Obtener plan del alumno por RUT
export const obtenerPlanAlumno = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    
    let nombrePlan = alumno.plan;
    
    // Si el plan es un ID (ObjectId válido), buscar el plan real
    if (alumno.plan && alumno.plan.length === 24 && /^[0-9a-fA-F]{24}$/.test(alumno.plan)) {
      try {
        const planEncontrado = await Plan.findById(alumno.plan);
        if (planEncontrado) {
          nombrePlan = planEncontrado.nombre;
          // Actualizar el alumno con el nombre del plan para futuras consultas
          await Alumno.findByIdAndUpdate(alumno._id, { plan: planEncontrado.nombre });
        }
      } catch (error) {
        console.error('Error buscando plan por ID:', error);
      }
    }
    
    res.json({ plan: {
      nombre: nombrePlan,
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

// Solicitar renovación (Alumno)
export const solicitarRenovacion = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    
    const { motivo } = req.body;
    
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    
    alumno.estadoRenovacion = 'solicitada';
    alumno.fechaSolicitud = new Date();
    alumno.motivoSolicitud = motivo;
    await alumno.save();
    
    res.json({ message: 'Solicitud enviada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al solicitar renovación', error });
  }
};

// Obtener estado de renovación (Alumno)
export const obtenerEstadoRenovacion = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    
    res.json({ 
      estado: alumno.estadoRenovacion || 'ninguno',
      fechaSolicitud: alumno.fechaSolicitud 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estado de renovación', error });
  }
};

// Listar alumnos para renovar (Admin)
export const obtenerAlumnosParaRenovar = async (req: Request, res: Response) => {
  try {
    const { filtro } = req.query; // 'todos', 'bloqueados', 'solicitados'
    
    let query = {};
    if (filtro === 'bloqueados') {
      // Incluir planes expirados y próximos a vencer (3 días o menos)
      const hoy = new Date();
      const proximosDias = new Date();
      proximosDias.setDate(hoy.getDate() + 3);
      
      query = { 
        $or: [
          { fechaTerminoPlan: { $lt: hoy } }, // Expirados
          { 
            fechaTerminoPlan: { $gte: hoy, $lte: proximosDias },
            estadoRenovacion: { $ne: 'solicitada' }
          } // Próximos a vencer sin solicitud
        ]
      };
    } else if (filtro === 'solicitados') {
      query = { estadoRenovacion: 'solicitada' };
    }
    
    const alumnos = await Alumno.find(query).select('nombre rut plan fechaInicioPlan fechaTerminoPlan limiteClases estadoRenovacion fechaSolicitud motivoSolicitud');
    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alumnos para renovar', error });
  }
};

// Renovar plan de alumno (Admin)
export const renovarPlanAlumno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fechaInicio, fechaFin, duracion, limiteClases, observaciones } = req.body;
    
    console.log('Datos recibidos para renovación:', { id, fechaInicio, fechaFin, duracion, limiteClases, observaciones });
    
    // Validar que todos los campos requeridos estén presentes
    if (!fechaInicio || !fechaFin || !duracion || !limiteClases) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos', 
        campos: { fechaInicio, fechaFin, duracion, limiteClases } 
      });
    }
    
    const alumno = await Alumno.findById(id);
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    
    // Actualizar datos del plan
    alumno.fechaInicioPlan = fechaInicio;
    alumno.fechaTerminoPlan = fechaFin;
    alumno.duracion = duracion;
    alumno.limiteClases = limiteClases;
    alumno.estadoRenovacion = 'completada';
    alumno.asistencias = []; // Resetear asistencias del nuevo período
    
    // Guardar log de renovación
    alumno.historialRenovaciones = alumno.historialRenovaciones || [];
    alumno.historialRenovaciones.push({
      fecha: new Date(),
      fechaInicio,
      fechaFin,
      procesadoPor: (req as any).user?.id,
      observaciones
    });
    
    console.log('Intentando guardar alumno:', {
      id: alumno._id,
      fechaInicioPlan: alumno.fechaInicioPlan,
      fechaTerminoPlan: alumno.fechaTerminoPlan,
      duracion: alumno.duracion,
      limiteClases: alumno.limiteClases
    });
    
    try {
      await alumno.save();
      console.log('Alumno guardado exitosamente');
    } catch (saveError) {
      console.error('Error al guardar alumno:', saveError);
      throw saveError;
    }
    
    res.json({ 
      message: 'Plan renovado exitosamente',
      alumno: {
        nombre: alumno.nombre,
        rut: alumno.rut,
        fechaInicio: alumno.fechaInicioPlan,
        fechaFin: alumno.fechaTerminoPlan,
        limiteClases: alumno.limiteClases
      }
    });
  } catch (error) {
    console.error('Error completo en renovarPlanAlumno:', error);
    res.status(500).json({ 
      message: 'Error al renovar plan', 
      error: error.message || error,
      details: error
    });
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

    // Verificar que JWT_SECRET esté definida
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definida en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Generar JWT con rut
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        rut: alumno ? alumno.rut : undefined
      },
      process.env.JWT_SECRET as Secret,
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
      password,
      limiteClases
    } = req.body;
    if (!nombre || !rut || !direccion || !fechaNacimiento || !email || !telefono || !plan || !fechaInicioPlan || !duracion || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    
    // Buscar el plan por ID para obtener el nombre
    const planEncontrado = await Plan.findById(plan);
    if (!planEncontrado) {
      return res.status(404).json({ message: 'Plan no encontrado.' });
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
      plan: planEncontrado.nombre, // Guardar el nombre del plan en lugar del ID
      fechaInicioPlan,
      fechaTerminoPlan: termino.toISOString(),
      duracion,
      monto,
      limiteClases: limiteClases || 'todos_los_dias',
      asistencias: [],
      avisos: []
    });
    await nuevoAlumno.save();
    return res.status(201).json({ message: 'Alumno y usuario creados exitosamente.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al inscribir alumno.', error });
  }
};
