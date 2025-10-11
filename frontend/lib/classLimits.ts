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
 * Calcula los límites de clases para un alumno considerando la fecha de término del plan
 * @param limiteClases Límite de clases del plan ('12', '8', 'todos_los_dias')
 * @param asistenciasMes Array de fechas de asistencia en el mes actual
 * @param fechaReferencia Fecha de referencia (por defecto hoy)
 * @param fechaInicioPlan Fecha de inicio del plan (opcional)
 * @param fechaFinPlan Fecha de término del plan (opcional)
 * @returns Información sobre los límites de clases
 */
export function calcularLimiteClases(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaReferencia: Date = new Date(),
  fechaInicioPlan?: string,
  fechaFinPlan?: string
): LimiteClasesInfo {
  const hoy = fechaReferencia;
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  
  // Obtener el primer y último día del mes
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  
  // Calcular días hábiles del mes (lunes a sábado)
  const diasHabiles = calcularDiasHabiles(primerDia, ultimoDia);
  
  // Filtrar asistencias según el período del plan o mes actual
  let asistenciasFiltradas: string[];
  
  if (fechaInicioPlan && fechaFinPlan) {
    // Filtrar por período del plan (compatible con backend)
    // El backend también filtra por período del plan, no por mes calendario
    const inicioPlan = new Date(fechaInicioPlan);
    const finPlan = new Date(fechaFinPlan);
    
    asistenciasFiltradas = asistenciasMes.filter(fecha => {
      const fechaAsistencia = new Date(fecha);
      return fechaAsistencia >= inicioPlan && fechaAsistencia <= finPlan;
    });
  } else {
    // Si no hay fechas específicas, filtrar por mes actual
    asistenciasFiltradas = asistenciasMes.filter(fecha => {
      const fechaAsistencia = new Date(fecha);
      return fechaAsistencia.getFullYear() === año && fechaAsistencia.getMonth() === mes;
    });
  }
  
  const diasUsados = asistenciasFiltradas.length;
  
  // Debug: Log de información para verificar cálculos
  console.log('🔍 calcularLimiteClases Debug:', {
    limiteClases,
    asistenciasMes: asistenciasMes.length,
    asistenciasFiltradas: asistenciasFiltradas.length,
    fechaInicioPlan,
    fechaFinPlan,
    diasUsados,
    hoy: hoy.toISOString()
  });
  
  // Calcular días hábiles del período del plan si se proporcionan fechas
  let diasHabilesPlan: number | null = null;
  let diasHabilesRestantesPlan: number | null = null;
  
  if (fechaInicioPlan && fechaFinPlan) {
    const inicioPlan = new Date(fechaInicioPlan);
    const finPlan = new Date(fechaFinPlan);
    diasHabilesPlan = calcularDiasHabiles(inicioPlan, finPlan);
    diasHabilesRestantesPlan = calcularDiasHabiles(hoy, finPlan);
  }
  
  let diasDisponibles: number;
  let puedeAcceder: boolean;
  let mensaje: string;
  
  switch (limiteClases) {
    case 'todos_los_dias':
      // Si hay período específico del plan, usar días hábiles del período
      if (diasHabilesPlan !== null) {
        diasDisponibles = diasHabilesPlan;
        puedeAcceder = diasHabilesRestantesPlan !== null && diasHabilesRestantesPlan > 0;
        mensaje = diasHabilesRestantesPlan !== null && diasHabilesRestantesPlan > 0
          ? `Puedes acceder todos los días hábiles restantes (${diasHabilesRestantesPlan} días disponibles)`
          : `Tu plan ha terminado`;
      } else {
        diasDisponibles = diasHabiles;
        puedeAcceder = true;
        mensaje = `Puedes acceder todos los días hábiles del mes (${diasHabiles} días disponibles)`;
      }
      break;
      
    case '12':
      // Si hay período específico del plan, aplicar protocolo del gimnasio
      if (diasHabilesPlan !== null) {
        // PROTOCOLO: Reducir límite según días hábiles disponibles
        const limiteReal = Math.min(12, diasHabilesPlan);
        diasDisponibles = limiteReal;
        puedeAcceder = diasUsados < limiteReal && (diasHabilesRestantesPlan !== null && diasHabilesRestantesPlan > 0);
        mensaje = diasUsados < limiteReal
          ? `Puedes acceder hasta ${limiteReal} días (${limiteReal - diasUsados} restantes)`
          : `Has alcanzado el límite de ${limiteReal} clases disponibles`;
      } else {
        diasDisponibles = 12;
        puedeAcceder = diasUsados < 12;
        mensaje = diasUsados < 12 
          ? `Puedes acceder hasta 12 días al mes (${12 - diasUsados} días restantes)`
          : `Has alcanzado el límite de 12 clases este mes`;
      }
      break;
      
    case '8':
      // Si hay período específico del plan, aplicar protocolo del gimnasio
      if (diasHabilesPlan !== null) {
        // PROTOCOLO: Reducir límite según días hábiles disponibles
        const limiteReal = Math.min(8, diasHabilesPlan);
        diasDisponibles = limiteReal;
        puedeAcceder = diasUsados < limiteReal && (diasHabilesRestantesPlan !== null && diasHabilesRestantesPlan > 0);
        mensaje = diasUsados < limiteReal
          ? `Puedes acceder hasta ${limiteReal} días (${limiteReal - diasUsados} restantes)`
          : `Has alcanzado el límite de ${limiteReal} clases disponibles`;
      } else {
        diasDisponibles = 8;
        puedeAcceder = diasUsados < 8;
        mensaje = diasUsados < 8
          ? `Puedes acceder hasta 8 días al mes (${8 - diasUsados} días restantes)`
          : `Has alcanzado el límite de 8 clases este mes`;
      }
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
    diasRestantes: Math.max(0, diasDisponibles - diasUsados),
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
 * @param fechaInicioPlan Fecha de inicio del plan (opcional)
 * @param fechaFinPlan Fecha de término del plan (opcional)
 * @returns true si puede acceder, false si no
 */
export function puedeAccederHoy(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaHoy: Date = new Date(),
  fechaInicioPlan?: string,
  fechaFinPlan?: string
): boolean {
  const info = calcularLimiteClases(limiteClases, asistenciasMes, fechaHoy, fechaInicioPlan, fechaFinPlan);
  
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
 * @param fechaInicioPlan Fecha de inicio del plan (opcional)
 * @param fechaFinPlan Fecha de término del plan (opcional)
 * @returns Mensaje descriptivo del estado
 */
export function obtenerMensajeLimite(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaReferencia: Date = new Date(),
  fechaInicioPlan?: string,
  fechaFinPlan?: string
): string {
  const info = calcularLimiteClases(limiteClases, asistenciasMes, fechaReferencia, fechaInicioPlan, fechaFinPlan);
  return info.mensaje;
}

/**
 * Obtiene el color del indicador según el estado del límite
 * @param limiteClases Límite de clases del plan
 * @param asistenciasMes Array de fechas de asistencia en el mes actual
 * @param fechaReferencia Fecha de referencia (por defecto hoy)
 * @param fechaInicioPlan Fecha de inicio del plan (opcional)
 * @param fechaFinPlan Fecha de término del plan (opcional)
 * @returns Color CSS para el indicador
 */
export function obtenerColorIndicador(
  limiteClases: LimiteClases,
  asistenciasMes: string[],
  fechaReferencia: Date = new Date(),
  fechaInicioPlan?: string,
  fechaFinPlan?: string
): string {
  const info = calcularLimiteClases(limiteClases, asistenciasMes, fechaReferencia, fechaInicioPlan, fechaFinPlan);
  
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
