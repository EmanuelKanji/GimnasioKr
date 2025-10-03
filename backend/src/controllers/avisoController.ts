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
    
    // Limpiar y normalizar RUTs de destinatarios
    const destinatariosLimpios = destinatarios.map(rut => {
      const rutLimpio = rut.replace(/\.|-/g, '').toUpperCase();
      console.log(`📤 RUT original: ${rut} -> RUT limpio: ${rutLimpio}`);
      return rutLimpio;
    });
    
    const aviso = new Aviso({ 
      titulo, 
      mensaje, 
      profesor, 
      destinatarios: destinatariosLimpios
    });
    
    await aviso.save();
    
    console.log(`✅ Aviso creado exitosamente con ID: ${aviso._id}`);
    console.log(`✅ Destinatarios finales:`, aviso.destinatarios);
    
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
    console.log(`🔍 RUT original: ${rut}`);
    
    // Buscar avisos con diferentes formatos de RUT
    const avisos = await Aviso.find({ 
      destinatarios: { 
        $in: [
          rutLimpio,           // RUT limpio: 123456789
          rut,                 // RUT original: 12.345.678-9
          rut.replace(/\./g, ''), // RUT sin puntos: 12345678-9
          rut.replace(/-/g, ''),  // RUT sin guión: 12.345.6789
          rut.replace(/\.|-/g, '').replace(/(\d)(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4'), // Formato con puntos y guión
          rut.replace(/\.|-/g, '').replace(/(\d)(\d{3})(\d{3})(\d{1})/, '$1$2$3$4')     // Formato sin separadores
        ]
      }
    }).sort({ fecha: -1 });
    
    console.log(`📬 Encontrados ${avisos.length} avisos para el alumno`);
    console.log(`📬 Avisos encontrados:`, avisos.map(a => ({ titulo: a.titulo, destinatarios: a.destinatarios })));
    
    res.json(avisos);
  } catch (err) {
    console.error('❌ Error al obtener avisos del alumno:', err);
    res.status(500).json({ error: 'Error al obtener avisos' });
  }
};
