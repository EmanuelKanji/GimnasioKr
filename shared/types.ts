// Tipos TypeScript compartidos entre frontend y backend

export type UserRole = 'alumno' | 'profesor' | 'admin';

export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  suscripcion: 'mensual' | 'trimestral' | 'anual';
}

export interface Attendance {
  _id: string;
  userId: string;
  fecha: string;
  validadoPor: string; // id del profesor
}

export interface Plan {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: 'mensual' | 'trimestral' | 'anual';
}
