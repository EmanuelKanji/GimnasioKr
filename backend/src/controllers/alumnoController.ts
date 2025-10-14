import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Alumno from '../models/Alumno';
import Plan from '../models/Plan';
import { AttendanceService } from '../services/attendanceService';
import { executeTransaction, log } from '../utils/transactionHelper';

// Obtener plan del alumno por RUT
export const obtenerPlanAlumno = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    
    let nombrePlan = alumno.plan;
    let descripcionPlan = alumno.descripcionPlan || 'Plan de gimnasio';
    let limiteClasesPlan = alumno.limiteClases || 'todos_los_dias';
    
    // Buscar plan en la colección Plan para obtener descripción actualizada
    if (alumno.plan && alumno.plan.length === 24 && /^[0-9a-fA-F]{24}$/.test(alumno.plan)) {
      try {
        const planEncontrado = await Plan.findById(alumno.plan);
        if (planEncontrado) {
          nombrePlan = planEncontrado.nombre;
          descripcionPlan = planEncontrado.descripcion;
          limiteClasesPlan = planEncontrado.limiteClases;
          // Actualizar el alumno con el nombre del plan para futuras consultas
          await Alumno.findByIdAndUpdate(alumno._id, { 
            plan: planEncontrado.nombre,
            descripcionPlan: planEncontrado.descripcion,
            limiteClases: planEncontrado.limiteClases
          });
        }
      } catch (error) {
        console.error('Error buscando plan por ID:', error);
      }
    } else {
      // Buscar plan por nombre para obtener descripción
      try {
        const planEncontrado = await Plan.findOne({ nombre: alumno.plan });
        if (planEncontrado) {
          descripcionPlan = planEncontrado.descripcion;
          limiteClasesPlan = alumno.limiteClases || planEncontrado.limiteClases;
          // Actualizar descripción del alumno si no la tiene
          if (!alumno.descripcionPlan) {
            await Alumno.findByIdAndUpdate(alumno._id, { 
              descripcionPlan: planEncontrado.descripcion,
              limiteClases: limiteClasesPlan
            });
          }
        }
      } catch (error) {
        console.error('Error buscando plan por nombre:', error);
      }
    }
    
    // Determinar estado de pago basado en si el QR está bloqueado
    const hoy = new Date();
    const inicio = new Date(alumno.fechaInicioPlan);
    const fin = new Date(alumno.fechaTerminoPlan);
    const planActivo = hoy >= inicio && hoy <= fin;
    
    // Calcular días restantes
    const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determinar si está bloqueado (plan expirado o próximo a vencer sin renovación)
    const estaBloqueado = !planActivo || 
                         (diasRestantes < 0) || 
                         (diasRestantes <= 3 && alumno.estadoRenovacion !== 'solicitada');
    
    res.json({ 
      plan: {
        nombre: nombrePlan,
        descripcion: descripcionPlan,
        fechaInicio: alumno.fechaInicioPlan,
        fechaFin: alumno.fechaTerminoPlan,
        estadoPago: estaBloqueado ? 'bloqueado' : 'activo',
        monto: alumno.monto,
        limiteClases: limiteClasesPlan,
        duracion: alumno.duracion,
        descuentoEspecial: alumno.descuentoEspecial || 'ninguno',
        porcentajeDescuento: alumno.porcentajeDescuento || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener plan de alumno', error });
  }
};

// Obtener asistencia del alumno por RUT
export const obtenerAsistenciaAlumno = async (req: Request, res: Response) => {
  try {
    const rut = (req as any).user?.rut;
    if (!rut) return res.status(400).json({ message: 'RUT no presente en el token' });
    
    const alumno = await Alumno.findOne({ rut });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    
    // Filtrar asistencias por período del plan actual usando el servicio centralizado
    let asistenciasFiltradas = alumno.asistencias || [];
    if (alumno.fechaInicioPlan && alumno.fechaTerminoPlan) {
      asistenciasFiltradas = AttendanceService.filtrarAsistenciasPorPeriodoPlan(
        alumno.asistencias || [],
        alumno.fechaInicioPlan,
        alumno.fechaTerminoPlan
      );
      
      const inicioPlan = new Date(alumno.fechaInicioPlan);
      const finPlan = new Date(alumno.fechaTerminoPlan);
      console.log(`📊 Alumno ${alumno.nombre}: ${asistenciasFiltradas.length} asistencias del período ${inicioPlan.toLocaleDateString()} - ${finPlan.toLocaleDateString()}`);
      console.log(`📊 Asistencias filtradas:`, asistenciasFiltradas);
    } else {
      console.log(`📊 Alumno ${alumno.nombre}: ${asistenciasFiltradas.length} asistencias totales (sin filtro de período)`);
    }
    
    res.json({ diasAsistidos: asistenciasFiltradas });
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
    const { plan, fechaInicio, fechaFin, duracion, limiteClases, observaciones, descuentoEspecial } = req.body;
    
    console.log('Datos recibidos para renovación:', { id, plan, fechaInicio, fechaFin, duracion, limiteClases, observaciones });
    
    // Validar que todos los campos requeridos estén presentes
    if (!plan || !fechaInicio || !fechaFin || !duracion || !limiteClases) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos', 
        campos: { plan, fechaInicio, fechaFin, duracion, limiteClases } 
      });
    }
    
    const alumno = await Alumno.findById(id);
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

    // Calcular descuento según el tipo
    let porcentajeDescuento = 0;
    if (descuentoEspecial === 'familiar_x2') {
      porcentajeDescuento = 10;
    } else if (descuentoEspecial === 'familiar_x3') {
      porcentajeDescuento = 15;
    }
    
    // Buscar el plan para obtener la descripción
    let descripcionPlan = 'Plan de gimnasio';
    try {
      const planEncontrado = await Plan.findOne({ nombre: plan });
      if (planEncontrado) {
        descripcionPlan = planEncontrado.descripcion;
      }
    } catch (error) {
      console.error('Error buscando plan para renovación:', error);
    }
    
    // Actualizar datos del plan
    alumno.plan = plan; // Actualizar el plan asignado
    alumno.fechaInicioPlan = fechaInicio;
    alumno.fechaTerminoPlan = fechaFin;
    alumno.duracion = duracion;
    alumno.limiteClases = limiteClases;
    alumno.descripcionPlan = descripcionPlan;
    alumno.descuentoEspecial = descuentoEspecial || 'ninguno';
    alumno.porcentajeDescuento = porcentajeDescuento;
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
        plan: alumno.plan,
        fechaInicio: alumno.fechaInicioPlan,
        fechaFin: alumno.fechaTerminoPlan,
        limiteClases: alumno.limiteClases,
        descuentoEspecial: alumno.descuentoEspecial,
        porcentajeDescuento: alumno.porcentajeDescuento
      }
    });
  } catch (error) {
    console.error('Error completo en renovarPlanAlumno:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ 
      message: 'Error al renovar plan', 
      error: errorMessage,
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
      limiteClases,
      descuentoEspecial
    } = req.body;
    // Validar solo campos obligatorios
    if (!nombre || !rut || !email || !plan || !duracion || !password) {
      return res.status(400).json({ message: 'Los campos obligatorios son: nombre, RUT, email, plan, duración y contraseña.' });
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
    // Función auxiliar para limpiar RUT (quitar puntos y guiones, convertir K a mayúscula)
    const limpiarRut = (r: string) => r.replace(/\.|-/g, '').toUpperCase();
    
    const rutLimpio = limpiarRut(rut);
    console.log('🔍 Crear Alumno - RUT recibido:', rut);
    console.log('🔍 Crear Alumno - RUT limpio:', rutLimpio);
    
    // Verificar si el alumno ya existe
    const alumnoExistente = await Alumno.findOne({ rut: rutLimpio });
    if (alumnoExistente) {
      return res.status(409).json({ message: 'El alumno ya está inscrito.' });
    }

    // Validar que descuento solo aplique a mensual/trimestral
    if (descuentoEspecial && descuentoEspecial !== 'ninguno') {
      if (duracion === 'semestral' || duracion === 'anual') {
        return res.status(400).json({ 
          message: 'Los descuentos familiares no aplican a planes semestrales o anuales' 
        });
      }
    }

    // Calcular descuento
    let porcentajeDescuento = 0;
    if (descuentoEspecial === 'familiar_x2') {
      porcentajeDescuento = 10;
    } else if (descuentoEspecial === 'familiar_x3') {
      porcentajeDescuento = 15;
    }

    // Aplicar descuento al monto
    const montoConDescuento = monto * (1 - porcentajeDescuento / 100);
    
    // Calcular fecha de término según duración
    const inicio = fechaInicioPlan ? new Date(fechaInicioPlan) : new Date();
    let termino = new Date(inicio);
    if (duracion === 'mensual') {
      termino.setMonth(termino.getMonth() + 1);
    } else if (duracion === 'trimestral') {
      termino.setMonth(termino.getMonth() + 3);
    } else if (duracion === 'semestral') {
      termino.setMonth(termino.getMonth() + 6);
    } else if (duracion === 'anual') {
      termino.setFullYear(termino.getFullYear() + 1);
    }

    // Crear usuario y alumno en transacción
    await executeTransaction([
      // Operación 1: Crear usuario
      async (session) => {
        const nuevoUsuario = new User({ 
          username: email, 
          password, 
          role: 'alumno', 
          rut: rutLimpio 
        });
        await nuevoUsuario.save({ session });
        
        log.info('Usuario creado', {
          email: email,
          rut: rutLimpio,
          action: 'crear_usuario'
        });
      },
      
      // Operación 2: Crear alumno
      async (session) => {
        const nuevoAlumno = new Alumno({
          nombre,
          rut: rutLimpio,
          direccion: direccion || '',
          fechaNacimiento: fechaNacimiento || '',
          email,
          telefono: telefono || '',
          plan: planEncontrado.nombre,
          fechaInicioPlan: fechaInicioPlan || inicio.toISOString(),
          fechaTerminoPlan: termino.toISOString(),
          duracion,
          monto: montoConDescuento,
          limiteClases: limiteClases || planEncontrado.limiteClases || 'todos_los_dias',
          descripcionPlan: planEncontrado.descripcion,
          descuentoEspecial: descuentoEspecial || 'ninguno',
          porcentajeDescuento,
          asistencias: [],
          avisos: []
        });
        await nuevoAlumno.save({ session });
        
        log.audit('Alumno creado', {
          nombre: nombre,
          rut: rutLimpio,
          email: email,
          plan: planEncontrado.nombre,
          duracion: duracion,
          monto: montoConDescuento,
          descuentoEspecial: descuentoEspecial,
          action: 'crear_alumno'
        });
      }
    ], {
      email: email,
      rut: rutLimpio,
      action: 'crear_alumno_completo'
    });

    return res.status(201).json({ message: 'Alumno y usuario creados exitosamente.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al inscribir alumno.', error });
  }
};
