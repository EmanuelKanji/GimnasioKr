import type { UserRole } from '../../shared/types';

declare module 'react-qr-scanner';

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    nombre: string;
    email: string;
    rol: UserRole;
  };
}
