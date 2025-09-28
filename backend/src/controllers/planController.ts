import { Request, Response } from 'express';
import Plan from '../models/Plan';
import { AuthenticatedRequest } from '../middleware/auth';

export const createPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nombre, descripcion, precio, duracionMeses, clasesPorSemana } = req.body;

    const plan = new Plan({
      nombre,
      descripcion,
      precio,
      duracionMeses,
      clasesPorSemana
    });

    await plan.save();

    res.status(201).json({
      message: 'Plan creado exitosamente',
      plan
    });
  } catch (error) {
    console.error('Error creando plan:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getPlans = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, activo } = req.query;

    const query: any = {};
    if (activo !== undefined) {
      query.activo = activo === 'true';
    }

    const plans = await Plan.find(query)
      .sort({ fechaCreacion: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Plan.countDocuments(query);

    res.json({
      plans,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getPlan = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('Error obteniendo plan:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updatePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nombre, descripcion, precio, duracionMeses, clasesPorSemana, activo } = req.body;

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, duracionMeses, clasesPorSemana, activo },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    res.json({
      message: 'Plan actualizado exitosamente',
      plan
    });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deletePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    res.json({ message: 'Plan desactivado exitosamente' });
  } catch (error) {
    console.error('Error desactivando plan:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};