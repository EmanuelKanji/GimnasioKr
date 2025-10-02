/**
 * Utilidades para manejo de fechas en el sistema de asistencia
 */

export interface CalendarWeek {
  dates: (Date | undefined)[];
}

export interface CalendarMonth {
  weeks: CalendarWeek[];
  year: number;
  month: number;
}

/**
 * Genera un calendario mensual que inicia en lunes
 * @param year Año del calendario
 * @param month Mes del calendario (0-11)
 * @returns Objeto con las semanas del mes
 */
export function generateMonthlyCalendar(year: number, month: number): CalendarMonth {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: CalendarWeek[] = [];
  let currentWeek: (Date | undefined)[] = [];
  
  // Ajuste: getDay() 0=domingo, 1=lunes... queremos que 1=lunes sea el inicio
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7; // domingo como último día
  
  // Agregar días vacíos al inicio de la semana
  for (let i = 1; i < startDay; i++) {
    currentWeek.push(undefined);
  }
  
  // Agregar días del mes
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    currentWeek.push(date);
    
    if (currentWeek.length === 7) {
      weeks.push({ dates: currentWeek });
      currentWeek = [];
    }
  }
  
  // Completar la última semana si es necesario
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(undefined);
    }
    weeks.push({ dates: currentWeek });
  }
  
  return { weeks, year, month };
}

/**
 * Genera las fechas de la semana actual (lunes a domingo)
 * @param date Fecha de referencia (por defecto hoy)
 * @returns Array de fechas de la semana
 */
export function generateCurrentWeek(date: Date = new Date()): Date[] {
  const dayOfWeek = date.getDay();
  // Si es domingo (0), retroceder 6 días para llegar al lunes anterior
  // Si es otro día, retroceder (dayOfWeek - 1) días para llegar al lunes
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  
  return weekDates;
}

/**
 * Convierte una fecha a formato ISO (YYYY-MM-DD)
 * @param date Fecha a convertir
 * @returns String en formato ISO
 */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Verifica si una fecha está en la lista de asistencias
 * @param date Fecha a verificar
 * @param asistencias Lista de fechas de asistencia en formato ISO
 * @returns true si asistió, false si no
 */
export function isAsistido(date: Date, asistencias: string[]): boolean {
  const iso = toISODate(date);
  return asistencias.includes(iso);
}

/**
 * Obtiene el nombre del día de la semana en español
 * @param date Fecha
 * @returns Nombre del día
 */
export function getDayName(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

/**
 * Obtiene el nombre abreviado del día de la semana en español
 * @param date Fecha
 * @returns Nombre abreviado del día
 */
export function getShortDayName(date: Date): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}

/**
 * Obtiene el nombre del mes en español
 * @param month Número del mes (0-11)
 * @returns Nombre del mes
 */
export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}
