'use client';
import { useState, useEffect } from 'react';
import styles from './RenovarPlanes.module.css';

interface AlumnoParaRenovar {
  _id: string;
  nombre: string;
  rut: string;
  plan: string;
  fechaInicioPlan: string;
  fechaTerminoPlan: string;
  limiteClases: string;
  estadoRenovacion: 'ninguno' | 'solicitada' | 'procesando' | 'completada';
  fechaSolicitud?: string;
  motivoSolicitud?: string;
}

export default function RenovarPlanes() {
  const [alumnos, setAlumnos] = useState<AlumnoParaRenovar[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'bloqueados' | 'solicitados'>('todos');
  const [loading, setLoading] = useState(true);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<string | null>(null);
  const [formularioRenovacion, setFormularioRenovacion] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    duracion: 'mensual',
    limiteClases: 'todos_los_dias',
    observaciones: ''
  });

  // Cargar alumnos para renovar
  const cargarAlumnos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/para-renovar?filtro=${filtro}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data);
      }
    } catch (error) {
      console.error('Error cargando alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, [filtro]);

  // Manejar cambio de duración para calcular fecha fin
  const handleDuracionChange = (duracion: string) => {
    const inicio = new Date(formularioRenovacion.fechaInicio);
    let fin = new Date(inicio);
    
    if (duracion === 'mensual') {
      fin.setMonth(fin.getMonth() + 1);
    } else if (duracion === 'trimestral') {
      fin.setMonth(fin.getMonth() + 3);
    } else if (duracion === 'anual') {
      fin.setFullYear(fin.getFullYear() + 1);
    }
    
    setFormularioRenovacion({
      ...formularioRenovacion,
      duracion,
      fechaFin: fin.toISOString().split('T')[0]
    });
  };

  // Renovar plan de alumno
  const handleRenovar = async (alumnoId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/${alumnoId}/renovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formularioRenovacion)
      });
      
      if (res.ok) {
        alert('Plan renovado exitosamente');
        setAlumnoSeleccionado(null);
        cargarAlumnos(); // Recargar lista
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error renovando plan:', error);
      alert('Error al renovar plan');
    }
  };

  // Calcular días restantes del plan
  const calcularDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Obtener estado visual del alumno
  const obtenerEstadoVisual = (alumno: AlumnoParaRenovar) => {
    const diasRestantes = calcularDiasRestantes(alumno.fechaTerminoPlan);
    
    if (alumno.estadoRenovacion === 'solicitada') {
      return { texto: 'Solicitud enviada', color: '#f59e0b', icono: '⏳' };
    } else if (diasRestantes < 0) {
      return { texto: 'Plan expirado', color: '#ef4444', icono: '❌' };
    } else if (diasRestantes <= 3) {
      return { texto: `Termina en ${diasRestantes} días`, color: '#f59e0b', icono: '⚠️' };
    } else {
      return { texto: 'QR bloqueado', color: '#6b7280', icono: '🔒' };
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando alumnos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔄 Renovar Planes</h2>
      
      {/* Filtros */}
      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${filtro === 'todos' ? styles.active : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos ({alumnos.length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filtro === 'bloqueados' ? styles.active : ''}`}
          onClick={() => setFiltro('bloqueados')}
        >
          QR Bloqueados ({alumnos.filter(a => a.estadoRenovacion === 'ninguno').length})
        </button>
        <button 
          className={`${styles.filterBtn} ${filtro === 'solicitados' ? styles.active : ''}`}
          onClick={() => setFiltro('solicitados')}
        >
          Con Solicitud ({alumnos.filter(a => a.estadoRenovacion === 'solicitada').length})
        </button>
      </div>

      {/* Lista de Alumnos */}
      <div className={styles.alumnosList}>
        {alumnos.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay alumnos que requieran renovación</p>
          </div>
        ) : (
          alumnos.map(alumno => {
            const estado = obtenerEstadoVisual(alumno);
            const diasRestantes = calcularDiasRestantes(alumno.fechaTerminoPlan);
            
            return (
              <div key={alumno._id} className={styles.alumnoCard}>
                <div className={styles.alumnoInfo}>
                  <h3 className={styles.alumnoNombre}>{alumno.nombre}</h3>
                  <p className={styles.alumnoRut}>RUT: {alumno.rut}</p>
                  <p className={styles.alumnoPlan}>Plan: {alumno.plan}</p>
                  <p className={styles.alumnoFechas}>
                    {new Date(alumno.fechaInicioPlan).toLocaleDateString('es-CL')} - {new Date(alumno.fechaTerminoPlan).toLocaleDateString('es-CL')}
                  </p>
                  <div className={styles.estadoContainer}>
                    <span 
                      className={styles.estado}
                      style={{ color: estado.color }}
                    >
                      {estado.icono} {estado.texto}
                    </span>
                    {diasRestantes > 0 && (
                      <span className={styles.diasRestantes}>
                        {diasRestantes} días restantes
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button 
                    onClick={() => setAlumnoSeleccionado(alumno._id)}
                    className={styles.renovarBtn}
                  >
                    🔄 Renovar Plan
                  </button>
                </div>

                {/* Formulario de Renovación Expandido */}
                {alumnoSeleccionado === alumno._id && (
                  <div className={styles.formularioRenovacion}>
                    <h4>Renovar Plan para {alumno.nombre}</h4>
                    <form onSubmit={(e) => { e.preventDefault(); handleRenovar(alumno._id); }}>
                      <div className={styles.formGroup}>
                        <label>Fecha de Inicio:</label>
                        <input 
                          type="date" 
                          value={formularioRenovacion.fechaInicio}
                          onChange={(e) => setFormularioRenovacion({...formularioRenovacion, fechaInicio: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Duración:</label>
                        <select 
                          value={formularioRenovacion.duracion}
                          onChange={(e) => handleDuracionChange(e.target.value)}
                        >
                          <option value="mensual">Mensual</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="anual">Anual</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Límite de Clases:</label>
                        <select 
                          value={formularioRenovacion.limiteClases}
                          onChange={(e) => setFormularioRenovacion({...formularioRenovacion, limiteClases: e.target.value})}
                        >
                          <option value="todos_los_dias">Todos los días</option>
                          <option value="12">12 clases/mes</option>
                          <option value="8">8 clases/mes</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Observaciones:</label>
                        <textarea 
                          value={formularioRenovacion.observaciones}
                          onChange={(e) => setFormularioRenovacion({...formularioRenovacion, observaciones: e.target.value})}
                          placeholder="Notas sobre el pago o renovación..."
                          rows={3}
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className={styles.confirmarBtn}>
                          ✅ Confirmar Renovación
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAlumnoSeleccionado(null)}
                          className={styles.cancelarBtn}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
