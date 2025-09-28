import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JWTPayload {
  id: string;
  rut: string;
  rol: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id?.toString() || '',
    rut: user.rut,
    rol: user.rol
  };

  const secret = process.env.JWT_SECRET || 'fallback-secret';
  // Use 7 days in seconds
  const expiresIn = 7 * 24 * 60 * 60; // 7 days

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
};