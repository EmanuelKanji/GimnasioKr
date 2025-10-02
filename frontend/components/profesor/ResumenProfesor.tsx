import { useState, useEffect } from 'react';
import styles from './ResumenProfesor.module.css';

interface EstadisticasProfesor {
  asistenciasSemana: Array<{
    dia: string;
    asistencia: number;
    fecha: string;
  }>;
  alumnos: {
    total: number;
    activos: number;
    nuevos: number;
    misAlumnos: number;
  };
  avisos: Array<{
    id: string;
    titulo: string;
    fecha: string;
    leido: boolean;
    totalDestinatarios: number;
    totalLeidos: number;
  }>;
  resumen: {
    totalAsistenciasSemana: number;
    promedioAsistenciasDiarias: number;
    avisosEnviados: number;
    fechaActualizacion: string;
  };
}

export default function ResumenProfesor() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasProfesor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener estadísticas del profesor
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/estadisticas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject('Error al obtener estadísticas'))
      .then(data => {
        setEstadisticas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError('No se pudieron cargar las estadísticas');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Resumen semanal</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !estadisticas) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Resumen semanal</h2>
        <div className={styles.errorContainer}>
          <p>⚠️ {error || 'No se pudieron cargar las estadísticas'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { asistenciasSemana, alumnos, avisos, resumen } = estadisticas;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resumen semanal</h2>
      
      {/* Información de actualización */}
      <div className={styles.updateInfo}>
        <span>📊 Actualizado: {new Date(resumen.fechaActualizacion).toLocaleString('es-CL')}</span>
      </div>

      <div className={styles.compactBox}>
        <div className={styles.compactRow}>
          
          {/* Asistencias de la semana */}
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>📈 Asistencia semanal:</span>
            <div className={styles.weekRow}>
              {asistenciasSemana.map((clase) => (
                <div
                  key={clase.dia}
                  className={styles.asistenciaDia}
                  title={`${clase.dia}: ${clase.asistencia} alumnos - ${new Date(clase.fecha).toLocaleDateString('es-CL')}`}
                >
                  <span className={styles.diaNombre}>{clase.dia}</span>
                  <span className={styles.asistenciaNum}>{clase.asistencia}</span>
                </div>
              ))}
            </div>
            <div className={styles.statsRow}>
              <span>Total: {resumen.totalAsistenciasSemana}</span>
              <span>Promedio: {resumen.promedioAsistenciasDiarias}</span>
            </div>
          </div>

          {/* Estadísticas de alumnos */}
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>👥 Alumnos:</span>
            <div className={styles.alumnosInfo}>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Total:</span>
                <span className={styles.statValue}>{alumnos.total}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Activos:</span>
                <span className={`${styles.statValue} ${styles.positivo}`}>{alumnos.activos}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Nuevos:</span>
                <span className={`${styles.statValue} ${styles.positivo}`}>+{alumnos.nuevos}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Mis alumnos:</span>
                <span className={styles.statValue}>{alumnos.misAlumnos}</span>
              </div>
            </div>
          </div>

          {/* Avisos recientes */}
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>📢 Avisos recientes:</span>
            <div className={styles.avisosList}>
              {avisos.length === 0 ? (
                <div className={styles.noAvisos}>
                  <span>📭 No hay avisos recientes</span>
                </div>
              ) : (
                avisos.slice(0, 2).map((aviso) => (
                  <div key={aviso.id} className={styles.avisoItem}>
                    <div className={styles.avisoHeader}>
                      <span className={styles.avisoTitle}>{aviso.titulo}</span>
                      <span className={styles.avisoDate}>
                        {new Date(aviso.fecha).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                    <div className={styles.avisoStats}>
                      <span>👤 {aviso.totalDestinatarios} destinatarios</span>
                      <span>✅ {aviso.totalLeidos} leídos</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {resumen.avisosEnviados > 0 && (
              <div className={styles.avisosTotales}>
                Total enviados: {resumen.avisosEnviados}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}