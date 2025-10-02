/**
 * Utilidades para manejo de límites de clases por plan
 */

export type LimiteClases = '12' | '8' | 'todos_los_dias';

export interface LimiteClasesInfo {
  limite: LimiteClases;
  diasDisponibles: number;
  diasUsados: number;
  diasRestantes: number;
  puedeAcceder: boolean;
  mensaje: string;
}

/**
 * Calcula los límites de clases para un alumno en el mes actual
 * @param limiteClases Límite de clases del plan ('12', '8', 'todos_los_dias')
 * @param asistenciasMes Array de fechas de asistencia en el mes actual
 * @param fechaReferencia Fecha de referencia (por defecto hoy)
 * @returns Información sobre los límites de clases
 */
export function calcularLimiteClases(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaReferencia: Date = new Date()
): LimiteClasesInfo {
  const hoy = fechaReferencia;
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  
  // Obtener el primer y último día del mes
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  
  // Calcular días hábiles del mes (lunes a sábado)
  const diasHabiles = calcularDiasHabiles(primerDia, ultimoDia);
  
  // Filtrar asistencias del mes actual
  const asistenciasMesActual = asistenciasMes.filter(fecha => {
    const fechaAsistencia = new Date(fecha);
    return fechaAsistencia.getFullYear() === año && fechaAsistencia.getMonth() === mes;
  });
  
  const diasUsados = asistenciasMesActual.length;
  
  let diasDisponibles: number;
  let puedeAcceder: boolean;
  let mensaje: string;
  
  switch (limiteClases) {
    case 'todos_los_dias':
      diasDisponibles = diasHabiles;
      puedeAcceder = true; // Puede acceder todos los días hábiles
      mensaje = `Puedes acceder todos los días hábiles del mes (${diasHabiles} días disponibles)`;
      break;
      
    case '12':
      diasDisponibles = 12;
      puedeAcceder = diasUsados < 12;
      mensaje = diasUsados < 12 
        ? `Puedes acceder hasta 12 días al mes (${12 - diasUsados} días restantes)`
        : `Has alcanzado el límite de 12 clases este mes`;
      break;
      
    case '8':
      diasDisponibles = 8;
      puedeAcceder = diasUsados < 8;
      mensaje = diasUsados < 8
        ? `Puedes acceder hasta 8 días al mes (${8 - diasUsados} días restantes)`
        : `Has alcanzado el límite de 8 clases este mes`;
      break;
      
    default:
      diasDisponibles = 0;
      puedeAcceder = false;
      mensaje = 'Plan no válido';
  }
  
  return {
    limite: limiteClases,
    diasDisponibles,
    diasUsados,
    diasRestantes: diasDisponibles - diasUsados,
    puedeAcceder,
    mensaje
  };
}

/**
 * Calcula los días hábiles (lunes a sábado) entre dos fechas
 * @param fechaInicio Fecha de inicio
 * @param fechaFin Fecha de fin
 * @returns Número de días hábiles
 */
function calcularDiasHabiles(fechaInicio: Date, fechaFin: Date): number {
  let diasHabiles = 0;
  const fecha = new Date(fechaInicio);
  
  while (fecha <= fechaFin) {
    const diaSemana = fecha.getDay();
    // 1 = lunes, 2 = martes, ..., 6 = sábado (0 = domingo se excluye)
    if (diaSemana >= 1 && diaSemana <= 6) {
      diasHabiles++;
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  
  return diasHabiles;
}

/**
 * Verifica si un alumno puede acceder hoy según su límite de clases
 * @param limiteClases Límite de clases del plan
 * @param asistenciasMes Array de fechas de asistencia en el mes actual
 * @param fechaHoy Fecha de hoy (por defecto new Date())
 * @returns true si puede acceder, false si no
 */
export function puedeAccederHoy(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaHoy: Date = new Date()
): boolean {
  const info = calcularLimiteClases(limiteClases, asistenciasMes, fechaHoy);
  
  // Si es "todos_los_dias", verificar que sea día hábil
  if (limiteClases === 'todos_los_dias') {
    const diaSemana = fechaHoy.getDay();
    return diaSemana >= 1 && diaSemana <= 6; // Lunes a sábado
  }
  
  return info.puedeAcceder;
}

/**
 * Obtiene el mensaje de estado del límite de clases
 * @param limiteClases Límite de clases del plan
 * @param asistenciasMes Array de fechas de asistencia en el mes actual
 * @param fechaReferencia Fecha de referencia (por defecto hoy)
 * @returns Mensaje descriptivo del estado
 */
export function obtenerMensajeLimite(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaReferencia: Date = new Date()
): string {
  const info = calcularLimiteClases(limiteClases, asistenciasMes, fechaReferencia);
  return info.mensaje;
}

/**
 * Obtiene el color del indicador según el estado del límite
 * @param limiteClases Límite de clases del plan
 * @param asistenciasMes Array de fechas de asistencia en el mes actual
 * @param fechaReferencia Fecha de referencia (por defecto hoy)
 * @returns Color CSS para el indicador
 */
export function obtenerColorIndicador(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaReferencia: Date = new Date()
): string {
  const info = calcularLimiteClases(limiteClases, asistenciasMes, fechaReferencia);
  
  if (limiteClases === 'todos_los_dias') {
    return '#10b981'; // Verde - siempre disponible
  }
  
  if (info.diasRestantes > 3) {
    return '#10b981'; // Verde - muchos días restantes
  } else if (info.diasRestantes > 0) {
    return '#f59e0b'; // Amarillo - pocos días restantes
  } else {
    return '#ef4444'; // Rojo - límite alcanzado
  }
}
