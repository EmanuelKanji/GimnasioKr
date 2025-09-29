import Aviso from '../models/Aviso';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Crear aviso (POST)
export const crearAviso = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, mensaje, destinatarios } = req.body;
  const profesor = req.user?.rut || req.user?.id;
    const aviso = new Aviso({ titulo, mensaje, profesor, destinatarios });
    await aviso.save();
    res.status(201).json(aviso);
  } catch (err) {
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
    const avisos = await Aviso.find({ destinatarios: rut }).sort({ fecha: -1 });
    res.json(avisos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avisos' });
  }
};
