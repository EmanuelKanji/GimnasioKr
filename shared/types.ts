export interface PlanAlumno {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracion?: string;
  clases?: string | number;
  matricula?: string | number;
  estadoPago?: string;
  monto?: number;
  fechaInicio?: string;
  fechaTermino?: string;
  fechaFin?: string;
}

export interface Aviso {
  _id?: string;
  titulo?: string;
  mensaje?: string;
  fecha?: string;
  autor?: string;
  leido?: boolean;
}

export interface Asistencia {
  _id?: string;
  alumnoId?: string;
  fecha?: string;
  validadoPor?: string;
  rut?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  plan?: string;
}
export interface Alumno {
  nombre?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  fechaNacimiento?: string;
  plan?: string;
  fechaInicioPlan?: string;
  fechaTerminoPlan?: string;
  duracion?: string;
  monto?: number;
  password?: string;
  email?: string;
  limiteClases?: '12' | '8' | 'todos_los_dias';
}

export interface Plan {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  clases: string | number;
  matricula: string | number;
  duracion: 'mensual' | 'trimestral' | 'anual';
  limiteClases: '12' | '8' | 'todos_los_dias'; // Límite de clases por mes
}

export interface PerfilInfo {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  plan?: string;
  fechaInicioPlan?: string;
  fechaTerminoPlan?: string;
}
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
  clases: string | number; // puede ser "ilimitado" o un número
  matricula: string | number; // puede ser "gratis" o un número
  estadoPago: 'pagado' | 'pendiente' | 'vencido';
  monto: number;

}
