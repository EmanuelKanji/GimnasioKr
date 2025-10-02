import Aviso from '../models/Aviso';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Crear aviso (POST)
export const crearAviso = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, mensaje, destinatarios } = req.body;
    const profesor = req.user?.rut || req.user?.id;
    
    if (!profesor) {
      return res.status(400).json({ error: 'Profesor no identificado' });
    }
    
    if (!titulo || !mensaje || !destinatarios || !Array.isArray(destinatarios)) {
      return res.status(400).json({ error: 'Datos del aviso incompletos' });
    }
    
    console.log(`📝 Profesor ${profesor} creando aviso para ${destinatarios.length} alumnos:`, destinatarios);
    
    const aviso = new Aviso({ 
      titulo, 
      mensaje, 
      profesor, 
      destinatarios: destinatarios.map(rut => rut.replace(/\.|-/g, '').toUpperCase())
    });
    
    await aviso.save();
    
    console.log(`✅ Aviso creado exitosamente con ID: ${aviso._id}`);
    
    res.status(201).json(aviso);
  } catch (err) {
    console.error('❌ Error al crear aviso:', err);
    res.status(500).json({ error: 'Error al crear aviso' });
  }
};

// Obtener avisos enviados por el profesor (GET)
export const obtenerAvisosProfesor = async (req: AuthRequest, res: Response) => {
  try {
  const profesor = req.user?.rut || req.user?.id;
    const avisos = await Aviso.find({ profesor }).sort({ fecha: -1 });
    res.json(avisos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avisos' });
  }
};

// Obtener avisos para un alumno (GET)
export const obtenerAvisosAlumno = async (req: AuthRequest, res: Response) => {
  try {
    const rut = req.user?.rut;
    
    if (!rut) {
      return res.status(400).json({ error: 'RUT del alumno no encontrado' });
    }

    // Limpiar RUT para comparación
    const rutLimpio = rut.replace(/\.|-/g, '').toUpperCase();
    
    console.log(`🔍 Buscando avisos para alumno RUT: ${rutLimpio}`);
    
    const avisos = await Aviso.find({ 
      destinatarios: { $in: [rutLimpio, rut] } // Buscar tanto con formato limpio como original
    }).sort({ fecha: -1 });
    
    console.log(`📬 Encontrados ${avisos.length} avisos para el alumno`);
    
    res.json(avisos);
  } catch (err) {
    console.error('❌ Error al obtener avisos del alumno:', err);
    res.status(500).json({ error: 'Error al obtener avisos' });
  }
};
