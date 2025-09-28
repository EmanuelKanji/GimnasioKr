import Alumno from '../models/Alumno';

export const obtenerHistorialAsistencia = async (_req: Request, res: Response) => {
  try {
    const asistencias = await Asistencia.find().sort({ fecha: -1 });
    // Buscar datos del alumno por rut limpio
    const limpiarRut = (rut: string) => rut.replace(/\.|-/g, '').toUpperCase();
    const historial = await Promise.all(asistencias.map(async (asistencia: any) => {
      // Buscar alumno cuyo rut limpio coincida
      const alumnos = await Alumno.find();
      const alumno = alumnos.find(a => limpiarRut(a.rut) === limpiarRut(asistencia.rut));
      return {
        rut: asistencia.rut,
        fecha: asistencia.fecha,
        nombre: alumno?.nombre || 'No encontrado',
        email: alumno?.email || '',
        telefono: alumno?.telefono || '',
        plan: alumno?.plan || '',
      };
    }));
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de asistencia', error });
  }
};
import { Request, Response } from 'express';
import Asistencia from '../models/Asistencia';

export const registrarAsistencia = async (req: Request, res: Response) => {
  try {
    const { rut } = req.body;
    if (!rut) {
      return res.status(400).json({ message: 'El RUT es obligatorio.' });
    }
    const asistencia = await Asistencia.create({ rut, fecha: new Date() });

    // Actualizar el array de asistencias del alumno
    const AlumnoModel = require('../models/Alumno').default;
    const limpiarRut = (r: string) => r.replace(/\.|-/g, '').toUpperCase();
    // Buscar todos los alumnos y comparar rut limpio
    const alumnos = await AlumnoModel.find();
  const alumno = alumnos.find((a: any) => limpiarRut(a.rut) === limpiarRut(rut));
    if (alumno) {
      // Forzar formato YYYY-MM-DD sin hora ni desfase
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const fechaHoy = `${yyyy}-${mm}-${dd}`;
      if (!alumno.asistencias.includes(fechaHoy)) {
        alumno.asistencias.push(fechaHoy);
        await alumno.save();
      }
    }

    res.status(201).json({ message: 'Asistencia registrada.', asistencia });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar asistencia', error });
  }
};
