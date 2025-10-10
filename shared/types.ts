// ===== TIPOS COMPARTIDOS ENTRE FRONTEND Y BACKEND =====

// ===== ROLES Y USUARIOS =====
export type UserRole = 'alumno' | 'profesor' | 'admin';

export interface User {
  _id: string;
  username: string;
  role: UserRole;
  rut?: string;
}

// ===== ALUMNOS =====
export interface Alumno {
  _id?: string;
  nombre: string;
  rut: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  plan: string;
  fechaInicioPlan: string;
  fechaTerminoPlan: string;
  duracion: string;
  monto: number;
  limiteClases: '12' | '8' | 'todos_los_dias';
  descripcionPlan?: string;
  descuentoEspecial?: 'ninguno' | 'familiar_x2' | 'familiar_x3';
  porcentajeDescuento?: number;
  asistencias: string[]; // Fechas ISO
  avisos: {
    titulo: string;
    mensaje: string;
    fecha: string;
    leido: boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

// ===== PROFESORES =====
export interface Profesor {
  _id?: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  misAlumnos: string[]; // Array de RUTs de alumnos asignados
  createdAt?: string;
  updatedAt?: string;
}

// ===== PLANES =====
export interface Plan {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  clases: string | number;
  matricula: string | number;
  duracion: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  limiteClases: '12' | '8' | 'todos_los_dias';
  createdAt?: string;
  updatedAt?: string;
}

// ===== ASISTENCIAS =====
export interface Asistencia {
  _id?: string;
  rut: string;
  fecha: string | Date;
  nombre?: string;
  email?: string;
  telefono?: string;
  plan?: string;
  fechaTerminoPlan?: string; // Fecha de término del plan del alumno
  validadoPor?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== AVISOS =====
export interface Aviso {
  _id?: string;
  titulo: string;
  mensaje: string;
  fecha: string | Date;
  profesor: string; // id o rut del profesor
  destinatarios: string[]; // ruts de alumnos
  leidoPor: string[]; // ruts de alumnos que han leído el aviso
  tipo?: 'manual' | 'automatico'; // Tipo de aviso
  motivoAutomatico?: string; // Razón del aviso automático
  createdAt?: string;
  updatedAt?: string;
}

// ===== INTERFACES PARA FORMULARIOS =====
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
  limiteClases?: '12' | '8' | 'todos_los_dias';
  descripcionPlan?: string;
  duracion?: string;
  descuentoEspecial?: 'ninguno' | 'familiar_x2' | 'familiar_x3';
  porcentajeDescuento?: number;
}

export interface PlanAlumno {
  _id?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracion?: string;
  clases?: string | number;
  matricula?: string | number;
  estadoPago?: 'activo' | 'bloqueado' | 'pendiente';
  monto?: number;
  fechaInicio?: string;
  fechaTermino?: string;
  fechaFin?: string;
  limiteClases?: '12' | '8' | 'todos_los_dias';
}

// ===== INTERFACES PARA ESTADÍSTICAS =====
export interface EstadisticasProfesor {
  totalAlumnos: number;
  asistenciasHoy: number;
  asistenciasSemana: number;
  asistenciasMes: number;
  ultimaAsistencia?: string;
  alumnosConAsistenciaHoy: string[];
  alumnosSinAsistenciaHoy: string[];
  avisosRecientes: Aviso[];
}

export interface EstadisticasAlumno {
  totalAsistencias: number;
  asistenciasMes: number;
  limiteClases: '12' | '8' | 'todos_los_dias';
  diasRestantes: number;
  estadoPlan: 'Activo' | 'Próximo a vencer' | 'Vencido';
  primeraAsistencia?: string;
  ultimaAsistencia?: string;
}

// ===== INTERFACES PARA FORMULARIOS DE CREACIÓN =====
export interface CrearUsuarioForm {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  password: string;
  role: UserRole;
  plan?: string;
  duracion?: string;
  monto?: number;
  limiteClases?: '12' | '8' | 'todos_los_dias';
}

export interface InscribirAlumnoForm {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  plan: string;
  duracion: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  monto: number;
  limiteClases: '12' | '8' | 'todos_los_dias';
  password: string;
  fechaInicioPlan: string;
  descuentoEspecial?: 'ninguno' | 'familiar_x2' | 'familiar_x3';
}

// ===== INTERFACES PARA RESPUESTAS DE API =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
    rut?: string;
  };
}

// ===== INTERFACES PARA PAGINACIÓN =====
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== INTERFACES PARA FILTROS =====
export interface FiltrosAsistencia {
  rut?: string;
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  plan?: string;
}

export interface FiltrosAlumno {
  nombre?: string;
  rut?: string;
  plan?: string;
  estadoPlan?: 'Activo' | 'Próximo a vencer' | 'Vencido';
}

// ===== INTERFACES PARA EXPORTACIÓN =====
export interface ExcelExportData {
  asistencias: Asistencia[];
  estadisticas: {
    generales: Record<string, any>;
    porPlan: Record<string, any>;
    porDia: Record<string, any>;
    porAlumno: Record<string, any>;
  };
  alertasVencimiento: Array<{
    nombre: string;
    rut: string;
    email: string;
    plan: string;
    diasRestantes: number;
    estado: string;
    prioridad: string;
  }>;
}

// ===== TIPOS DE UTILIDAD =====
export type EstadoPlan = 'Activo' | 'Próximo a vencer' | 'Vencido';
export type PrioridadAlerta = 'ALTA' | 'MEDIA' | 'BAJA';
export type DuracionPlan = 'mensual' | 'trimestral' | 'semestral' | 'anual';
export type LimiteClases = '12' | '8' | 'todos_los_dias';

// ===== INTERFACES PARA COMPONENTES =====
export interface DashboardProps {
  children?: React.ReactNode;
}

export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

// ===== INTERFACES PARA EVENTOS =====
export interface AsistenciaRegistradaEvent {
  rut: string;
  nombre: string;
  fecha: string;
  plan: string;
}

// ===== INTERFACES PARA CONFIGURACIÓN =====
export interface AppConfig {
  apiUrl: string;
  version: string;
  environment: 'development' | 'production' | 'test';
}

// ===== INTERFACES PARA NOTIFICACIONES =====
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}