/**
 * Utilidades para manejo de límites de clases por plan
 */

import { AttendanceService } from './attendanceService';

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
  
  // Usar servicio centralizado para obtener mes actual del plan (renovación mensual)
  let asistenciasFiltradas: string[];
  let diasUsados: number;
  let diasDisponibles: number;
  let puedeAcceder: boolean;
  let mensaje: string;
  
  if (fechaInicioPlan && fechaFinPlan) {
    // Aplicar renovación mensual usando el servicio centralizado
    const mesActual = AttendanceService.obtenerMesActualDelPlan(fechaInicioPlan, fechaReferencia);
    
    // Filtrar asistencias del mes actual del plan
    asistenciasFiltradas = AttendanceService.filtrarAsistenciasPorPeriodoPlan(
      asistenciasMes,
      mesActual.inicio.toISOString(),
      mesActual.fin.toISOString()
    );
    
    diasUsados = asistenciasFiltradas.length;
    
    // Calcular días hábiles del mes actual del plan
    const diasHabilesMesActual = AttendanceService.calcularDiasHabiles(
      mesActual.inicio, 
      mesActual.fin
    );
    
    // Calcular días hábiles restantes del mes actual
    const diasHabilesRestantes = AttendanceService.calcularDiasHabilesRestantes(
      mesActual.fin, 
      fechaReferencia
    );
    
    // Debug: Log de información para verificar cálculos
    console.log('🔍 calcularLimiteClases Debug (con renovación mensual):', {
      limiteClases,
      asistenciasMesTotal: asistenciasMes.length,
      asistenciasFiltradas: asistenciasFiltradas.length,
      fechaInicioPlan,
      fechaFinPlan,
      mesActual: {
        inicio: mesActual.inicio.toISOString(),
        fin: mesActual.fin.toISOString(),
        numeroMes: mesActual.numeroMes
      },
      diasUsados,
      diasHabilesMesActual,
      diasHabilesRestantes,
      hoy: hoy.toISOString()
    });
    
    switch (limiteClases) {
      case 'todos_los_dias':
        diasDisponibles = diasHabilesMesActual;
        puedeAcceder = diasHabilesRestantes > 0;
        mensaje = diasHabilesRestantes > 0
          ? `Puedes acceder todos los días hábiles restantes (${diasHabilesRestantes} días disponibles)`
          : `Tu plan ha terminado`;
        break;
        
      case '12':
        // Aplicar protocolo del gimnasio: reducir límite según días hábiles restantes
        const limiteReal = AttendanceService.aplicarProtocoloGimnasio(12, diasHabilesRestantes);
        diasDisponibles = limiteReal;
        puedeAcceder = diasUsados < limiteReal && diasHabilesRestantes > 0;
        mensaje = diasUsados < limiteReal
          ? `Puedes acceder hasta ${limiteReal} días (${limiteReal - diasUsados} restantes)`
          : `Has alcanzado el límite de ${limiteReal} clases disponibles`;
        break;
        
      case '8':
        // Aplicar protocolo del gimnasio: reducir límite según días hábiles restantes
        const limiteReal8 = AttendanceService.aplicarProtocoloGimnasio(8, diasHabilesRestantes);
        diasDisponibles = limiteReal8;
        puedeAcceder = diasUsados < limiteReal8 && diasHabilesRestantes > 0;
        mensaje = diasUsados < limiteReal8
          ? `Puedes acceder hasta ${limiteReal8} días (${limiteReal8 - diasUsados} restantes)`
          : `Has alcanzado el límite de ${limiteReal8} clases disponibles`;
        break;
        
      default:
        diasDisponibles = 0;
        puedeAcceder = false;
        mensaje = 'Plan no válido';
    }
  } else {
    // Fallback: usar lógica anterior si no hay fechas del plan
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasHabiles = AttendanceService.calcularDiasHabiles(primerDia, ultimoDia);
    
    asistenciasFiltradas = asistenciasMes.filter(fecha => {
      const fechaAsistencia = new Date(fecha);
      return fechaAsistencia.getFullYear() === año && fechaAsistencia.getMonth() === mes;
    });
    
    diasUsados = asistenciasFiltradas.length;
    
    switch (limiteClases) {
      case 'todos_los_dias':
        diasDisponibles = diasHabiles;
        puedeAcceder = true;
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
