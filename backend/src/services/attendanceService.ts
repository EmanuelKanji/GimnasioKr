/**
 * Servicio centralizado para manejo de asistencias y cálculos de días hábiles
 * Unifica la lógica entre frontend y backend para evitar inconsistencias
 */

export class AttendanceService {
  /**
   * Calcula días hábiles (lunes a sábado) entre dos fechas
   * @param inicio Fecha de inicio
   * @param fin Fecha de fin
   * @returns Número de días hábiles
   */
  static calcularDiasHabiles(inicio: Date, fin: Date): number {
    let diasHabiles = 0;
    const fecha = new Date(inicio);
    
    while (fecha <= fin) {
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
   * Filtra asistencias según el período del plan (no mes calendario)
   * @param asistencias Array de fechas de asistencia
   * @param fechaInicioPlan Fecha de inicio del plan
   * @param fechaTerminoPlan Fecha de término del plan
   * @returns Array filtrado de asistencias
   */
  static filtrarAsistenciasPorPeriodoPlan(
    asistencias: string[], 
    fechaInicioPlan: string, 
    fechaTerminoPlan: string
  ): string[] {
    const inicio = new Date(fechaInicioPlan);
    const fin = new Date(fechaTerminoPlan);
    
    return asistencias.filter(fecha => {
      const fechaAsistencia = new Date(fecha);
      return fechaAsistencia >= inicio && fechaAsistencia <= fin;
    });
  }
  
  /**
   * Calcula el mes actual del plan considerando renovaciones mensuales
   * Para planes que duran más de 1 mes, cada mes se resetea el contador
   * @param fechaInicioPlan Fecha de inicio del plan
   * @param fechaActual Fecha actual (por defecto hoy)
   * @returns Objeto con inicio, fin y número del mes actual del plan
   */
  static obtenerMesActualDelPlan(
    fechaInicioPlan: string,
    fechaActual: Date = new Date()
  ): { inicio: Date, fin: Date, numeroMes: number } {
    const inicioPlan = new Date(fechaInicioPlan);
    
    // Calcular meses transcurridos desde el inicio del plan
    const mesesTranscurridos = Math.floor(
      (fechaActual.getTime() - inicioPlan.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    // Calcular inicio del mes actual del plan
    const inicioMes = new Date(inicioPlan);
    inicioMes.setMonth(inicioMes.getMonth() + mesesTranscurridos);
    
    // Calcular fin del mes actual del plan
    const finMes = new Date(inicioMes);
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(finMes.getDate() - 1); // Último día del mes del plan
    
    return {
      inicio: inicioMes,
      fin: finMes,
      numeroMes: mesesTranscurridos + 1
    };
  }
  
  /**
   * Valida que las fechas del plan sean válidas
   * @param fechaInicioPlan Fecha de inicio del plan
   * @param fechaTerminoPlan Fecha de término del plan
   * @returns true si las fechas son válidas, false si no
   */
  static validarFechasPlan(fechaInicioPlan: string, fechaTerminoPlan: string): boolean {
    if (!fechaInicioPlan || !fechaTerminoPlan) {
      return false;
    }
    
    const inicio = new Date(fechaInicioPlan);
    const fin = new Date(fechaTerminoPlan);
    
    return !isNaN(inicio.getTime()) && !isNaN(fin.getTime()) && inicio <= fin;
  }
  
  /**
   * Calcula días hábiles restantes desde hoy hasta el fin del período
   * @param fechaFin Fecha de fin del período
   * @param fechaActual Fecha actual (por defecto hoy)
   * @returns Número de días hábiles restantes
   */
  static calcularDiasHabilesRestantes(
    fechaFin: Date, 
    fechaActual: Date = new Date()
  ): number {
    // Ajustar fecha actual para no incluir el día actual en el cálculo
    const hoy = new Date(fechaActual);
    hoy.setHours(23, 59, 59, 999);
    
    return this.calcularDiasHabiles(hoy, fechaFin);
  }
  
  /**
   * Aplica el protocolo del gimnasio: reduce límite según días hábiles restantes
   * @param limiteOriginal Límite original de clases del plan
   * @param diasHabilesRestantes Días hábiles restantes
   * @returns Límite ajustado según protocolo
   */
  static aplicarProtocoloGimnasio(limiteOriginal: number, diasHabilesRestantes: number): number {
    return Math.min(limiteOriginal, diasHabilesRestantes);
  }
}
