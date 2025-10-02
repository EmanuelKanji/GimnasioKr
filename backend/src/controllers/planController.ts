import { Request, Response } from 'express';
import Plan from '../models/Plan';

export const obtenerPlanes = async (_req: Request, res: Response) => {
  try {
    const planes = await Plan.find();
    res.json(planes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los planes', error });
  }
};

export const crearPlan = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, clases, matricula, duracion } = req.body;
    if (!nombre || !descripcion || !precio || !clases || !matricula || !duracion) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    
    // Validar que el límite de clases sea válido
    const limiteClasesValidos = ['12', '8', 'todos_los_dias'];
    if (!limiteClasesValidos.includes(clases)) {
      return res.status(400).json({ message: 'Límite de clases inválido. Debe ser: 12, 8 o todos_los_dias' });
    }
    
    const existe = await Plan.findOne({ nombre });
    if (existe) {
      return res.status(409).json({ message: 'El plan ya existe.' });
    }
    
    const nuevoPlan = await Plan.create({ 
      nombre, 
      descripcion, 
      precio, 
      clases, 
      matricula, 
      duracion,
      limiteClases: clases // Mapear clases a limiteClases
    });
    res.status(201).json(nuevoPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el plan', error });
  }
};

export const eliminarPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eliminado = await Plan.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ message: 'Plan no encontrado.' });
    }
    res.json({ message: 'Plan eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el plan', error });
  }
};
