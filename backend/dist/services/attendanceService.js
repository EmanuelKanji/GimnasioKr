"use strict";
/**
 * Servicio centralizado para manejo de asistencias y cálculos de días hábiles
 * Unifica la lógica entre frontend y backend para evitar inconsistencias
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
class AttendanceService {
    /**
     * Calcula días hábiles (lunes a sábado) entre dos fechas
     * @param inicio Fecha de inicio
     * @param fin Fecha de fin
     * @returns Número de días hábiles
     */
    static calcularDiasHabiles(inicio, fin) {
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
    static filtrarAsistenciasPorPeriodoPlan(asistencias, fechaInicioPlan, fechaTerminoPlan) {
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
    static obtenerMesActualDelPlan(fechaInicioPlan, fechaActual = new Date()) {
        const inicioPlan = new Date(fechaInicioPlan);
        // Calcular días transcurridos desde el inicio del plan
        const diasTranscurridos = Math.floor((fechaActual.getTime() - inicioPlan.getTime()) / (1000 * 60 * 60 * 24));
        // Calcular meses transcurridos (usar 31 días para evitar problemas de borde)
        const mesesTranscurridos = Math.floor(diasTranscurridos / 31);
        // Calcular inicio del mes actual del plan
        const inicioMes = new Date(inicioPlan);
        inicioMes.setDate(inicioMes.getDate() + (mesesTranscurridos * 31));
        // Calcular fin del mes actual del plan (30 días después del inicio)
        const finMes = new Date(inicioMes);
        finMes.setDate(finMes.getDate() + 29); // 30 días - 1
        // Si la fecha actual está antes del inicio del mes calculado, 
        // significa que estamos en el primer mes
        if (fechaActual < inicioMes) {
            const primerMesInicio = new Date(inicioPlan);
            const primerMesFin = new Date(inicioPlan);
            primerMesFin.setDate(primerMesFin.getDate() + 29);
            return {
                inicio: primerMesInicio,
                fin: primerMesFin,
                numeroMes: 1
            };
        }
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
    static validarFechasPlan(fechaInicioPlan, fechaTerminoPlan) {
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
    static calcularDiasHabilesRestantes(fechaFin, fechaActual = new Date()) {
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
    static aplicarProtocoloGimnasio(limiteOriginal, diasHabilesRestantes) {
        return Math.min(limiteOriginal, diasHabilesRestantes);
    }
}
exports.AttendanceService = AttendanceService;
