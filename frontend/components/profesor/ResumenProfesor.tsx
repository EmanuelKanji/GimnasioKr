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
}

interface ResumenProfesorProps {
  onViewChange?: (view: "asistencia" | "alumnos" | "avisos" | "perfil") => void;
}

export default function ResumenProfesor({ onViewChange }: ResumenProfesorProps) {
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener datos del resumen usando componentes existentes
  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Obtener mis alumnos
        const misAlumnosResponse = await HttpClient.get<Alumno[]>('/profesor/mis-alumnos');
        if (misAlumnosResponse.error) {
          throw new Error(`Error al cargar mis alumnos: ${misAlumnosResponse.error}`);
        }

        // 2. Obtener todos los alumnos para estadísticas
        const todosAlumnosResponse = await HttpClient.get<Alumno[]>('/alumnos');
        if (todosAlumnosResponse.error) {
          throw new Error(`Error al cargar alumnos: ${todosAlumnosResponse.error}`);
        }

        // 3. Obtener avisos recientes
        const avisosResponse = await HttpClient.get<Array<{
          _id: string;
          titulo: string;
          fecha: string;
          destinatarios: string[];
        }>>('/avisos/profesor');
        if (avisosResponse.error) {
          throw new Error(`Error al cargar avisos: ${avisosResponse.error}`);
        }

        // 4. Obtener asistencias de hoy (simulado por ahora)
        const asistenciasHoy = Math.floor(Math.random() * 20) + 5; // Simulado

        const resumen: ResumenData = {
          misAlumnos: misAlumnosResponse.data || [],
          totalAlumnos: todosAlumnosResponse.data?.length || 0,
          avisosRecientes: (avisosResponse.data || []).slice(0, 3).map(aviso => ({
            id: aviso._id,
            titulo: aviso.titulo,
            fecha: aviso.fecha,
            destinatarios: aviso.destinatarios?.length || 0
          })),
          asistenciasHoy
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

  const { misAlumnos, totalAlumnos, avisosRecientes, asistenciasHoy } = resumenData;

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
            </div>
            
            {/* Lista de mis alumnos */}
            <div className={styles.misAlumnosList}>
              <h4>📋 Mis Alumnos Asignados:</h4>
              {misAlumnos.length === 0 ? (
                <p className={styles.noAlumnos}>No tienes alumnos asignados aún</p>
              ) : (
                <div className={styles.alumnosGrid}>
                  {misAlumnos.slice(0, 4).map((alumno) => (
                    <div key={alumno.rut} className={styles.alumnoCard}>
                      <div className={styles.alumnoNombre}>{alumno.nombre}</div>
                      <div className={styles.alumnoRut}>{alumno.rut}</div>
                      <div className={styles.alumnoPlan}>{alumno.plan}</div>
                    </div>
                  ))}
                  {misAlumnos.length > 4 && (
                    <div className={styles.masAlumnos}>
                      +{misAlumnos.length - 4} más
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