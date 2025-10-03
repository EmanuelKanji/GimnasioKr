import { useState, useEffect } from 'react';
import styles from './ResumenProfesor.module.css';
import mobileStyles from './ResumenProfesor-mobile.module.css';
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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const currentStyles = isMobile ? mobileStyles : styles;

  if (loading) {
    return (
      <div className={currentStyles.container}>
        <h2 className={currentStyles.title}>Resumen del Profesor</h2>
        <div className={currentStyles.loadingContainer}>
          <div className={currentStyles.loadingSpinner}></div>
          <p>Cargando resumen...</p>
        </div>
      </div>
    );
  }

  if (error || !resumenData) {
    return (
      <div className={currentStyles.container}>
        <h2 className={currentStyles.title}>Resumen del Profesor</h2>
        <div className={currentStyles.errorContainer}>
          <p>⚠️ {error || 'No se pudo cargar el resumen'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={currentStyles.retryButton}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { misAlumnos, totalAlumnos, avisosRecientes, asistenciasHoy, estadisticasDetalladas } = resumenData;

  return (
    <div className={currentStyles.container}>
      <h2 className={currentStyles.title}>Resumen del Profesor</h2>
      
      {/* Información de actualización */}
      <div className={currentStyles.updateInfo}>
        <span>📊 Actualizado: {new Date().toLocaleString('es-CL')}</span>
      </div>

      <div className={currentStyles.compactBox}>
        <div className={currentStyles.compactRow}>
          
          {/* Estadísticas de alumnos */}
          <div className={currentStyles.compactSection}>
            <span className={currentStyles.compactLabel}>👥 Mis Alumnos:</span>
            <div className={currentStyles.alumnosInfo}>
              <div className={currentStyles.alumnoStat}>
                <span className={currentStyles.statLabel}>Total alumnos:</span>
                <span className={currentStyles.statValue}>{totalAlumnos}</span>
              </div>
              <div className={currentStyles.alumnoStat}>
                <span className={currentStyles.statLabel}>Mis alumnos:</span>
                <span className={`${currentStyles.statValue} ${currentStyles.positivo}`}>{misAlumnos.length}</span>
              </div>
              <div className={currentStyles.alumnoStat}>
                <span className={currentStyles.statLabel}>Asistencias hoy:</span>
                <span className={currentStyles.statValue}>{asistenciasHoy}</span>
              </div>
              <div className={currentStyles.alumnoStat}>
                <span className={currentStyles.statLabel}>Asistencias semana:</span>
                <span className={currentStyles.statValue}>{estadisticasDetalladas.resumen.asistenciasMisAlumnosSemana}</span>
              </div>
              <div className={currentStyles.alumnoStat}>
                <span className={currentStyles.statLabel}>Promedio diario:</span>
                <span className={currentStyles.statValue}>{estadisticasDetalladas.resumen.promedioAsistenciasDiarias}</span>
              </div>
              <div className={currentStyles.alumnoStat}>
                <span className={currentStyles.statLabel}>Total semana:</span>
                <span className={currentStyles.statValue}>{estadisticasDetalladas.resumen.totalAsistenciasSemana}</span>
              </div>
            </div>
            
            {/* Lista de mis alumnos con estadísticas */}
            <div className={currentStyles.misAlumnosList}>
              <h4>📋 Mis Alumnos Asignados:</h4>
              {estadisticasDetalladas.misAlumnosDetallado.length === 0 ? (
                <p className={currentStyles.noAlumnos}>No tienes alumnos asignados aún</p>
              ) : (
                <div className={currentStyles.alumnosGrid}>
                  {estadisticasDetalladas.misAlumnosDetallado.slice(0, 4).map((alumno) => (
                    <div key={alumno.rut} className={currentStyles.alumnoCard}>
                      <div className={currentStyles.alumnoNombre}>{alumno.nombre}</div>
                      <div className={currentStyles.alumnoRut}>{alumno.rut}</div>
                      <div className={currentStyles.alumnoPlan}>{alumno.plan}</div>
                      <div className={currentStyles.alumnoStats}>
                        <span className={currentStyles.statItem}>
                          📅 {alumno.asistenciasSemana} esta semana
                        </span>
                        <span className={`${currentStyles.statItem} ${alumno.asistioHoy ? currentStyles.asistioHoy : currentStyles.noAsistioHoy}`}>
                          {alumno.asistioHoy ? '✅ Hoy' : '❌ No hoy'}
                        </span>
                        {alumno.ultimaAsistencia && (
                          <span className={currentStyles.statItem}>
                            🕒 {new Date(alumno.ultimaAsistencia).toLocaleDateString('es-CL')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {estadisticasDetalladas.misAlumnosDetallado.length > 4 && (
                    <div className={currentStyles.masAlumnos}>
                      +{estadisticasDetalladas.misAlumnosDetallado.length - 4} más
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avisos recientes */}
          <div className={currentStyles.compactSection}>
            <span className={currentStyles.compactLabel}>📢 Avisos Recientes:</span>
            <div className={currentStyles.avisosList}>
              {avisosRecientes.length === 0 ? (
                <div className={currentStyles.noAvisos}>
                  <span>📭 No hay avisos recientes</span>
                </div>
              ) : (
                avisosRecientes.map((aviso) => (
                  <div key={aviso.id} className={currentStyles.avisoItem}>
                    <div className={currentStyles.avisoHeader}>
                      <span className={currentStyles.avisoTitle}>{aviso.titulo}</span>
                      <span className={currentStyles.avisoDate}>
                        {new Date(aviso.fecha).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                    <div className={currentStyles.avisoStats}>
                      <span>👤 {aviso.destinatarios} destinatarios</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className={currentStyles.compactSection}>
            <span className={currentStyles.compactLabel}>⚡ Acciones Rápidas:</span>
            <div className={currentStyles.accionesGrid}>
              <button 
                className={currentStyles.accionItem}
                onClick={() => onViewChange?.('asistencia')}
                title="Ir a Pasar Asistencia"
              >
                <span className={currentStyles.accionIcon}>📷</span>
                <span className={currentStyles.accionText}>Pasar Asistencia</span>
              </button>
              <button 
                className={currentStyles.accionItem}
                onClick={() => onViewChange?.('alumnos')}
                title="Ver Lista de Alumnos"
              >
                <span className={currentStyles.accionIcon}>👥</span>
                <span className={currentStyles.accionText}>Ver Alumnos</span>
              </button>
              <button 
                className={currentStyles.accionItem}
                onClick={() => onViewChange?.('avisos')}
                title="Enviar Aviso a Alumnos"
              >
                <span className={currentStyles.accionIcon}>📢</span>
                <span className={currentStyles.accionText}>Enviar Aviso</span>
              </button>
              <button 
                className={currentStyles.accionItem}
                onClick={() => onViewChange?.('perfil')}
                title="Ver Mi Perfil"
              >
                <span className={currentStyles.accionIcon}>👤</span>
                <span className={currentStyles.accionText}>Mi Perfil</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}