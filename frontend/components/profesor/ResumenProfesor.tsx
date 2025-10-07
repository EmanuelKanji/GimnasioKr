import { useState, useEffect } from 'react';
import styles from './ResumenProfesor.module.css';
import { HttpClient } from '../../lib/httpClient';
import type { Alumno } from '../../../shared/types';

interface ResumenData {
  misAlumnos: Alumno[];
  totalAlumnos: number;
  avisosRecientes: Array<{
    id: string;
    titulo: string;
    fecha: string;
    destinatarios: number;
  }>;
  asistenciasHoy: number;
  estadisticasDetalladas: {
    misAlumnosDetallado: Array<{
      rut: string;
      nombre: string;
      plan: string;
      asistenciasSemana: number;
      asistioHoy: boolean;
      ultimaAsistencia: string | null;
    }>;
    resumen: {
      asistenciasMisAlumnosSemana: number;
      asistenciasHoyMisAlumnos: number;
      totalAsistenciasSemana: number;
      promedioAsistenciasDiarias: number;
    };
  };
}

interface ResumenProfesorProps {
  onViewChange?: (view: "asistencia" | "alumnos" | "avisos" | "perfil") => void;
}

export default function ResumenProfesor({ onViewChange }: ResumenProfesorProps) {
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Obtener datos del resumen usando el endpoint de estadísticas
  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setLoading(true);
        setError('');

        // Obtener estadísticas completas del profesor
        const estadisticasResponse = await HttpClient.get<{
          alumnos: {
            total: number;
            activos: number;
            nuevos: number;
            misAlumnos: number;
          };
          misAlumnosDetallado: Array<{
            rut: string;
            nombre: string;
            plan: string;
            asistenciasSemana: number;
            asistioHoy: boolean;
            ultimaAsistencia: string | null;
          }>;
          avisos: Array<{
            id: string;
            titulo: string;
            fecha: string;
            totalDestinatarios: number;
            totalLeidos: number;
          }>;
          resumen: {
            asistenciasMisAlumnosSemana: number;
            asistenciasHoyMisAlumnos: number;
            totalAsistenciasSemana: number;
            promedioAsistenciasDiarias: number;
            avisosEnviados: number;
            fechaActualizacion: string;
          };
        }>('/profesor/estadisticas');

        if (estadisticasResponse.error) {
          throw new Error(`Error al cargar estadísticas: ${estadisticasResponse.error}`);
        }

        const data = estadisticasResponse.data!;

        // Obtener mis alumnos para la lista
        const misAlumnosResponse = await HttpClient.get<Alumno[]>('/profesor/mis-alumnos');
        if (misAlumnosResponse.error) {
          throw new Error(`Error al cargar mis alumnos: ${misAlumnosResponse.error}`);
        }

        const resumen: ResumenData = {
          misAlumnos: misAlumnosResponse.data || [],
          totalAlumnos: data.alumnos.total,
          avisosRecientes: (data.avisos || []).slice(0, 3).map(aviso => ({
            id: aviso.id,
            titulo: aviso.titulo,
            fecha: aviso.fecha,
            destinatarios: aviso.totalDestinatarios
          })),
          asistenciasHoy: data.resumen.asistenciasHoyMisAlumnos,
          estadisticasDetalladas: {
            misAlumnosDetallado: data.misAlumnosDetallado || [],
            resumen: data.resumen
          }
        };

        setResumenData(resumen);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando resumen:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el resumen');
        setLoading(false);
      }
    };

    cargarResumen();
  }, []);


  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Resumen del Profesor</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando resumen...</p>
        </div>
      </div>
    );
  }

  if (error || !resumenData) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Resumen del Profesor</h2>
        <div className={styles.errorContainer}>
          <p>⚠️ {error || 'No se pudo cargar el resumen'}</p>
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

  const { misAlumnos, totalAlumnos, avisosRecientes, asistenciasHoy, estadisticasDetalladas } = resumenData;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resumen del Profesor</h2>
      
      {/* Información de actualización */}
      <div className={styles.updateInfo}>
        <span>📊 Actualizado: {new Date().toLocaleString('es-CL')}</span>
      </div>

      <div className={styles.compactBox}>
        <div className={styles.compactRow}>
          
          {/* Estadísticas de alumnos */}
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>👥 Mis Alumnos:</span>
            <div className={styles.alumnosInfo}>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Total alumnos:</span>
                <span className={styles.statValue}>{totalAlumnos}</span>
                </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Mis alumnos:</span>
                <span className={`${styles.statValue} ${styles.positivo}`}>{misAlumnos.length}</span>
            </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Asistencias hoy:</span>
                <span className={styles.statValue}>{asistenciasHoy}</span>
          </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Asistencias semana:</span>
                <span className={styles.statValue}>{estadisticasDetalladas.resumen.asistenciasMisAlumnosSemana}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Promedio diario:</span>
                <span className={styles.statValue}>{estadisticasDetalladas.resumen.promedioAsistenciasDiarias}</span>
              </div>
              <div className={styles.alumnoStat}>
                <span className={styles.statLabel}>Total semana:</span>
                <span className={styles.statValue}>{estadisticasDetalladas.resumen.totalAsistenciasSemana}</span>
              </div>
            </div>
            
            {/* Lista de mis alumnos con estadísticas */}
            <div className={styles.misAlumnosList}>
              <h4>📋 Mis Alumnos Asignados:</h4>
              {estadisticasDetalladas.misAlumnosDetallado.length === 0 ? (
                <p className={styles.noAlumnos}>No tienes alumnos asignados aún</p>
              ) : (
                <div className={styles.alumnosGrid}>
                  {estadisticasDetalladas.misAlumnosDetallado.slice(0, 4).map((alumno) => (
                    <div key={alumno.rut} className={styles.alumnoCard}>
                      <div className={styles.alumnoNombre}>{alumno.nombre}</div>
                      <div className={styles.alumnoRut}>{alumno.rut}</div>
                      <div className={styles.alumnoPlan}>{alumno.plan}</div>
                      <div className={styles.alumnoStats}>
                        <span className={styles.statItem}>
                          📅 {alumno.asistenciasSemana} esta semana
                        </span>
                        <span className={`${styles.statItem} ${alumno.asistioHoy ? styles.asistioHoy : styles.noAsistioHoy}`}>
                          {alumno.asistioHoy ? '✅ Hoy' : '❌ No hoy'}
                        </span>
                        {alumno.ultimaAsistencia && (
                          <span className={styles.statItem}>
                            🕒 {new Date(alumno.ultimaAsistencia).toLocaleDateString('es-CL')}
                          </span>
                        )}
              </div>
                    </div>
                  ))}
                  {estadisticasDetalladas.misAlumnosDetallado.length > 4 && (
                    <div className={styles.masAlumnos}>
                      +{estadisticasDetalladas.misAlumnosDetallado.length - 4} más
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avisos recientes */}
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>📢 Avisos Recientes:</span>
            <div className={styles.avisosList}>
              {avisosRecientes.length === 0 ? (
                <div className={styles.noAvisos}>
                  <span>📭 No hay avisos recientes</span>
                </div>
              ) : (
                avisosRecientes.map((aviso) => (
                  <div key={aviso.id} className={styles.avisoItem}>
                    <div className={styles.avisoHeader}>
                  <span className={styles.avisoTitle}>{aviso.titulo}</span>
                      <span className={styles.avisoDate}>
                        {new Date(aviso.fecha).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                    <div className={styles.avisoStats}>
                      <span>👤 {aviso.destinatarios} destinatarios</span>
                    </div>
                  </div>
                ))
              )}
            </div>
                </div>

          {/* Acciones rápidas */}
          <div className={styles.compactSection}>
            <span className={styles.compactLabel}>⚡ Acciones Rápidas:</span>
            <div className={styles.accionesGrid}>
              <button 
                className={styles.accionItem}
                onClick={() => onViewChange?.('asistencia')}
                title="Ir a Pasar Asistencia"
              >
                <span className={styles.accionIcon}>📷</span>
                <span className={styles.accionText}>Pasar Asistencia</span>
              </button>
              <button 
                className={styles.accionItem}
                onClick={() => onViewChange?.('alumnos')}
                title="Ver Lista de Alumnos"
              >
                <span className={styles.accionIcon}>👥</span>
                <span className={styles.accionText}>Ver Alumnos</span>
              </button>
              <button 
                className={styles.accionItem}
                onClick={() => onViewChange?.('avisos')}
                title="Enviar Aviso a Alumnos"
              >
                <span className={styles.accionIcon}>📢</span>
                <span className={styles.accionText}>Enviar Aviso</span>
              </button>
              <button 
                className={styles.accionItem}
                onClick={() => onViewChange?.('perfil')}
                title="Ver Mi Perfil"
              >
                <span className={styles.accionIcon}>👤</span>
                <span className={styles.accionText}>Mi Perfil</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}