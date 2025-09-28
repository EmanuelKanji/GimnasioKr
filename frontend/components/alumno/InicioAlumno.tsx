import styles from './InicioAlumno.module.css';
import { useEffect, useState } from 'react';

export default function InicioAlumno() {
  const [diasAsistidos, setDiasAsistidos] = useState<string[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fetch asistencia
    fetch('http://localhost:4000/api/alumnos/me/asistencias', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDiasAsistidos(data.diasAsistidos || []));
    // Fetch plan
    fetch('http://localhost:4000/api/alumnos/me/plan', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPlan(data.plan || null));
    // Fetch avisos
    fetch('http://localhost:4000/api/alumnos/me/avisos', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAvisos(data.avisos || []));
    setLoading(false);
  }, []);

  // Calcular la semana actual (lunes a domingo)
  const today = new Date();
  // getDay: 0=domingo, 1=lunes, ..., 6=sábado
  const dayOfWeek = today.getDay();
  // Si es domingo (0), retroceder 6 días para llegar al lunes anterior
  // Si es otro día, retroceder (dayOfWeek - 1) días para llegar al lunes
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().slice(0, 10));
  }

  // Filtrar asistencias solo de la semana actual
  const asistenciasSemana = diasAsistidos.filter((d) => weekDates.includes(d));

  if (loading) {
  return <div className={styles.container}>Cargando resumen...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resumen semanal</h2>
      <div className={styles.compactBox}>
        <div className={styles.compactRow}>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Asistencia:</span>
            <div className={styles.weekRow}>
              {weekDates.map((date, idx) => {
                const dateObj = new Date(date);
                const asistido = asistenciasSemana.includes(date);
                return (
                  <div
                    key={date}
                    className={asistido ? styles.asistido : styles.noAsistido}
                    title={dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })}
                  >
                    {dateObj.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Plan:</span>
            <div className={styles.planInfo}>
              <span className={styles.planName}>{plan?.nombre || 'Sin plan'}</span>
              <span className={plan?.estadoPago === 'pagado' ? styles.paid : styles.pending}>
                {plan?.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
              </span>
              <span className={styles.planDates}>{plan ? `${new Date(plan.fechaInicio).toLocaleDateString('es-CL')} - ${new Date(plan.fechaFin).toLocaleDateString('es-CL')}` : ''}</span>
              <span className={styles.planMonto}>{plan ? `$${plan.monto?.toLocaleString('es-CL')}` : ''}</span>
            </div>
          </div>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Avisos:</span>
            <div className={styles.avisosList}>
              {avisos.slice(0,2).map((aviso, idx) => (
                <div key={idx} className={aviso.leido ? styles.leido : styles.noleido}>
                  <span className={styles.avisoTitle}>{aviso.titulo}</span>
                  <span className={styles.avisoDate}>{new Date(aviso.fecha).toLocaleDateString('es-CL')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
