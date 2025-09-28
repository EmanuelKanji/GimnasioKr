import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No se proporcionó token de acceso' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Verificar que el usuario todavía existe y está activo
    const user = await User.findById(decoded.id);
    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Token inválido o usuario inactivo' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso' });
    }

    next();
  };
};

export { AuthenticatedRequest };