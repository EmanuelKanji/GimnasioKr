import styles from './InicioAlumno.module.css';
import { generateCurrentWeek, generateMonthlyCalendar, isAsistido, toISODate, getMonthName } from '../../lib/dateUtils';
import { useAsistencias } from '../../hooks/useAsistencias';
import { usePlan } from '../../hooks/usePlan';
import { useAvisos } from '../../hooks/useAvisos';

export default function InicioAlumno() {
  const { asistencias: diasAsistidos, loading: asistenciasLoading } = useAsistencias();
  const { plan, loading: planLoading } = usePlan();
  const { avisos, loading: avisosLoading } = useAvisos('alumno');
  
  // Calcular loading general
  const loading = asistenciasLoading || planLoading || avisosLoading;

  // Calcular la semana actual (lunes a domingo)
  const today = new Date();
  const weekDates = generateCurrentWeek(today);
  // const weekDatesISO = weekDates.map(toISODate);

  // Filtrar asistencias solo de la semana actual
  // const asistenciasSemana = diasAsistidos.filter((d) => weekDatesISO.includes(d));

  // Generar calendario mensual para mostrar en el resumen
  const calendar = generateMonthlyCalendar(today.getFullYear(), today.getMonth());

  if (loading) {
  return <div className={styles.container}>Cargando resumen...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resumen semanal</h2>
      <div className={styles.compactBox}>
        <div className={styles.compactRow}>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Asistencia - {getMonthName(today.getMonth())} {today.getFullYear()}:</span>
            <div className={styles.calendarContainer}>
              {/* Semana actual */}
              <div className={styles.weekRow}>
                <span className={styles.weekLabel}>Esta semana:</span>
                {weekDates.map((date) => {
                  const asistido = isAsistido(date, diasAsistidos);
                  return (
                    <div
                      key={toISODate(date)}
                      className={asistido ? styles.asistido : styles.noAsistido}
                      title={`${date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })} - ${asistido ? 'Asistió' : 'No asistió'}`}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              {/* Mini calendario mensual */}
              <div className={styles.miniCalendar}>
                <div className={styles.calendarHeader}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                  ))}
                </div>
                {calendar.weeks.slice(0, 3).map((week, weekIdx) => (
                  <div key={weekIdx} className={styles.calendarWeek}>
                    {week.dates.map((date, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`${styles.calendarDay} ${!date ? styles.emptyDay : ''} ${date && isAsistido(date, diasAsistidos) ? styles.asistido : styles.noAsistido}`}
                      >
                        {date ? date.getDate() : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Plan:</span>
            <div className={styles.planInfo}>
              <span className={styles.planName}>{plan?.nombre || 'Sin plan'}</span>
              <span className={plan?.estadoPago === 'activo' ? styles.paid : styles.pending}>
                {plan?.estadoPago === 'activo' ? 'Activo' : 
                 plan?.estadoPago === 'bloqueado' ? 'Bloqueado' : 'Pendiente'}
              </span>
              <span className={styles.planDates}>{plan?.fechaInicio ? `${new Date(plan.fechaInicio).toLocaleDateString('es-CL')}` : ''}{plan?.fechaFin ? ` - ${new Date(plan.fechaFin).toLocaleDateString('es-CL')}` : ''}</span>
              <span className={styles.planMonto}>{plan ? `$${plan.monto?.toLocaleString('es-CL')}` : ''}</span>
            </div>
          </div>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Avisos:</span>
            <div className={styles.avisosList}>
                {avisos.slice(0, 2).map((aviso) => (
                <div key={aviso.titulo} className={styles.noleido}>
                  <span className={styles.avisoTitle}>{aviso.titulo}</span>
                  <span className={styles.avisoDate}>{aviso.fecha ? new Date(aviso.fecha).toLocaleDateString('es-CL') : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
