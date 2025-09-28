import styles from './ResumenProfesor.module.css';

export default function ResumenProfesor() {
  // Datos de ejemplo
  const clasesSemana = [
    { dia: 'Lun', asistencia: 15, fecha: '2025-09-22' },
    { dia: 'Mar', asistencia: 18, fecha: '2025-09-23' },
    { dia: 'Mié', asistencia: 17, fecha: '2025-09-24' },
    { dia: 'Jue', asistencia: 16, fecha: '2025-09-25' },
    { dia: 'Vie', asistencia: 14, fecha: '2025-09-26' },
    { dia: 'Sáb', asistencia: 12, fecha: '2025-09-27' },
    { dia: 'Dom', asistencia: 10, fecha: '2025-09-28' },
  ];
  
  const alumnos = {
    activos: 34,
    nuevos: 3,
    bajas: 1,
  };
  
  const avisos = [
    { id: '1', titulo: 'Reunión de profesores', fecha: '2025-09-24', leido: false },
    { id: '2', titulo: 'Actualización de sistema', fecha: '2025-09-22', leido: true },
  ];

  // Calcular estadísticas adicionales como en InicioAlumno
  const totalAsistencia = clasesSemana.reduce((sum, clase) => sum + clase.asistencia, 0);
  const promedioAsistencia = Math.round(totalAsistencia / clasesSemana.length);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resumen semanal</h2>
      <div className={styles.compactBox}>
        <div className={styles.compactRow}>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Asistencia semanal:</span>
            <div className={styles.weekRow}>
              {clasesSemana.map((clase) => (
                <div
                  key={clase.dia}
                  className={styles.asistenciaDia}
                  title={`${clase.dia}: ${clase.asistencia} alumnos`}
                >
                  <span className={styles.diaNombre}>{clase.dia}</span>
                  <span className={styles.asistenciaNum}>{clase.asistencia}</span>
                </div>
              ))}
            </div>
            <div className={styles.statsRow}>
              <span>Total: {totalAsistencia}</span>
              <span>Promedio: {promedioAsistencia}</span>
            </div>
          </div>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Alumnos:</span>
            <div className={styles.alumnosInfo}>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Activos:</span>
                <span className={styles.statValue}>{alumnos.activos}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Nuevos:</span>
                <span className={`${styles.statValue} ${styles.positivo}`}>+{alumnos.nuevos}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Bajas:</span>
                <span className={`${styles.statValue} ${styles.negativo}`}>-{alumnos.bajas}</span>
              </div>
            </div>
          </div>
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>Avisos:</span>
            <div className={styles.avisosList}>
              {avisos.slice(0,2).map((aviso) => (
                <div key={aviso.id} className={aviso.leido ? styles.leido : styles.noleido}>
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