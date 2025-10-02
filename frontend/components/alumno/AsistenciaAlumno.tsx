
import styles from './AsistenciaAlumno.module.css';
import { useEffect, useState } from 'react';
import { generateMonthlyCalendar, isAsistido, getMonthName } from '../../lib/dateUtils';

export default function AsistenciaAlumno() {
  const [diasAsistidos, setDiasAsistidos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarAsistencias = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/alumnos/me/asistencias', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setDiasAsistidos(data.diasAsistidos || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching asistencias:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsistencias();
    
    // Actualizar cada 30 segundos para sincronización en tiempo real
    const interval = setInterval(cargarAsistencias, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Escuchar eventos de actualización desde otros componentes
  useEffect(() => {
    const handleAsistenciaUpdate = () => {
      cargarAsistencias();
    };

    window.addEventListener('asistenciaRegistrada', handleAsistenciaUpdate);
    
    return () => {
      window.removeEventListener('asistenciaRegistrada', handleAsistenciaUpdate);
    };
  }, []);

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
