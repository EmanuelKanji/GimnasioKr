import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JWTPayload {
  id: string;
  rut: string;
  rol: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    rut: user.rut,
    rol: user.rol
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
};