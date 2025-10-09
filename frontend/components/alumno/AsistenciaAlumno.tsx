
import styles from './AsistenciaAlumno.module.css';
import { generateMonthlyCalendar, isAsistido, getMonthName } from '../../lib/dateUtils';
import { useAsistencias } from '../../hooks/useAsistencias';

export default function AsistenciaAlumno() {
  const { asistencias: diasAsistidos, loading } = useAsistencias();

  // Generación de calendario que inicia en lunes
  const today = new Date();
  const calendar = generateMonthlyCalendar(today.getFullYear(), today.getMonth());

  if (loading) return <div className={styles.container}>Cargando asistencia...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Asistencia - {getMonthName(today.getMonth())} {today.getFullYear()}</h2>
      <div className={styles.calendarBox}>
        <table className={styles.calendar}>
          <thead>
            <tr>
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d) => (
                <th key={d} className={styles.dayHeader}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.weeks.map((week, i) => (
              <tr key={i}>
                {week.dates.map((date, j) => (
                  <td key={j} className={date ? styles.dayCell : styles.emptyCell}>
                    {date && (
                      <div className={isAsistido(date, diasAsistidos) ? styles.asistido : styles.noAsistido}>
                        {date.getDate()}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
