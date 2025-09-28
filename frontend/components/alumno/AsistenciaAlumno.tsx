
import styles from './AsistenciaAlumno.module.css';
import { useEffect, useState } from 'react';

export default function AsistenciaAlumno() {
  const [diasAsistidos, setDiasAsistidos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/alumnos/me/asistencias', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setDiasAsistidos(data.diasAsistidos || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching asistencias:', error);
        setLoading(false);
      });
  }, []);

  // Generación de calendario que inicia en lunes
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: (Date | undefined)[][] = [];
  let currentWeek: (Date | undefined)[] = [];
  // Ajuste: getDay() 0=domingo, 1=lunes... queremos que 1=lunes sea el inicio
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7; // domingo como último día
  for (let i = 1; i < startDay; i++) currentWeek.push(undefined);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(undefined);
    weeks.push(currentWeek);
  }
  const isAsistido = (date: Date | undefined) => {
    if (!date) return false;
    const iso = date.toISOString().slice(0, 10);
    return diasAsistidos.includes(iso);
  };

  if (loading) return <div className={styles.container}>Cargando asistencia...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Asistencia mensual</h2>
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
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((date, j) => (
                  <td key={j} className={date ? styles.dayCell : styles.emptyCell}>
                    {date && (
                      <div className={isAsistido(date) ? styles.asistido : styles.noAsistido}>
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
