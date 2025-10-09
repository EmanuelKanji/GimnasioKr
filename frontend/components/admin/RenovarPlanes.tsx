'use client';
import { useState, useEffect, useCallback } from 'react';
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
  // Calcular fecha fin inicial
  const calcularFechaFin = (fechaInicio: string, duracion: string) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(inicio);
    
    if (duracion === 'mensual') {
      fin.setMonth(fin.getMonth() + 1);
    } else if (duracion === 'trimestral') {
      fin.setMonth(fin.getMonth() + 3);
    } else if (duracion === 'semestral') {
      fin.setMonth(fin.getMonth() + 6);
    } else if (duracion === 'anual') {
      fin.setFullYear(fin.getFullYear() + 1);
    }
    
    return fin.toISOString().split('T')[0];
  };

  const [formularioRenovacion, setFormularioRenovacion] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: calcularFechaFin(new Date().toISOString().split('T')[0], 'mensual'),
    duracion: 'mensual',
    limiteClases: 'todos_los_dias',
    observaciones: '',
    descuentoEspecial: 'ninguno',
    monto: 0
  });

  // Cargar alumnos para renovar
  const cargarAlumnos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/para-renovar?filtro=${filtro}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAlumnos(data);
      } else if (res.status === 401) {
        console.error('Token expirado o inválido');
        // Redirigir al login
        window.location.href = '/login-admin';
      } else {
        console.error('Error cargando alumnos:', res.status);
      }
    } catch (error) {
      console.error('Error cargando alumnos:', error);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    cargarAlumnos();
  }, [filtro, cargarAlumnos]);

  // Manejar cambio de duración para calcular fecha fin
  const handleDuracionChange = (duracion: string) => {
    const fechaFin = calcularFechaFin(formularioRenovacion.fechaInicio, duracion);
    
    setFormularioRenovacion({
      ...formularioRenovacion,
      duracion,
      fechaFin
    });
  };

  // Manejar cambio de fecha de inicio para recalcular fecha fin
  const handleFechaInicioChange = (fechaInicio: string) => {
    const fechaFin = calcularFechaFin(fechaInicio, formularioRenovacion.duracion);
    
    setFormularioRenovacion({
      ...formularioRenovacion,
      fechaInicio,
      fechaFin
    });
  };

  // Renovar plan de alumno
  const handleRenovar = async (alumnoId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación');
        return;
      }

      // Validar que todos los campos estén completos
      if (!formularioRenovacion.fechaInicio || !formularioRenovacion.fechaFin || !formularioRenovacion.duracion || !formularioRenovacion.limiteClases) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      // Validar que descuentos no se apliquen a planes semestrales/anuales
      if ((formularioRenovacion.descuentoEspecial === 'familiar_x2' || formularioRenovacion.descuentoEspecial === 'familiar_x3') && 
          (formularioRenovacion.duracion === 'semestral' || formularioRenovacion.duracion === 'anual')) {
        alert('Los descuentos familiares solo aplican a planes mensuales y trimestrales');
        return;
      }

      // Preparar datos para el backend
      const datosRenovacion = {
        fechaInicio: formularioRenovacion.fechaInicio,
        fechaFin: formularioRenovacion.fechaFin,
        duracion: formularioRenovacion.duracion,
        limiteClases: formularioRenovacion.limiteClases,
        observaciones: formularioRenovacion.observaciones || '',
        descuentoEspecial: formularioRenovacion.descuentoEspecial,
        monto: formularioRenovacion.monto || undefined
      };

      console.log('Enviando datos de renovación:', datosRenovacion);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/${alumnoId}/renovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosRenovacion)
      });
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('Respuesta exitosa:', responseData);
        alert('Plan renovado exitosamente');
        setAlumnoSeleccionado(null);
        cargarAlumnos(); // Recargar lista
      } else if (res.status === 401) {
        alert('Sesión expirada. Redirigiendo al login...');
        window.location.href = '/login-admin';
      } else {
        const errorData = await res.json();
        console.error('Error del servidor:', errorData);
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error renovando plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      alert(`Error al renovar plan: ${errorMessage}`);
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

  // Calcular conteos para los filtros
  const calcularConteos = () => {
    const todos = alumnos.length;
    const bloqueados = alumnos.filter(a => {
      const diasRestantes = calcularDiasRestantes(a.fechaTerminoPlan);
      return diasRestantes < 0 || (a.estadoRenovacion !== 'solicitada' && diasRestantes <= 3);
    }).length;
    const solicitados = alumnos.filter(a => a.estadoRenovacion === 'solicitada').length;
    
    return { todos, bloqueados, solicitados };
  };

  const conteos = calcularConteos();

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
          Todos ({conteos.todos})
        </button>
        <button 
          className={`${styles.filterBtn} ${filtro === 'bloqueados' ? styles.active : ''}`}
          onClick={() => setFiltro('bloqueados')}
        >
          QR Bloqueados ({conteos.bloqueados})
        </button>
        <button 
          className={`${styles.filterBtn} ${filtro === 'solicitados' ? styles.active : ''}`}
          onClick={() => setFiltro('solicitados')}
        >
          Con Solicitud ({conteos.solicitados})
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
                          onChange={(e) => handleFechaInicioChange(e.target.value)}
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
                          <option value="semestral">Semestral (6 meses)</option>
                          <option value="anual">Anual</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Fecha de Término (calculada):</label>
                        <input 
                          type="date" 
                          value={formularioRenovacion.fechaFin}
                          readOnly
                          className={styles.readOnlyInput}
                        />
                        <small className={styles.helpText}>
                          Esta fecha se calcula automáticamente según la duración seleccionada
                        </small>
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
                        <label>Descuento Especial:</label>
                        <select 
                          value={formularioRenovacion.descuentoEspecial}
                          onChange={(e) => setFormularioRenovacion({...formularioRenovacion, descuentoEspecial: e.target.value})}
                          disabled={formularioRenovacion.duracion === 'semestral' || formularioRenovacion.duracion === 'anual'}
                        >
                          <option value="ninguno">Sin descuento especial</option>
                          <option value="familiar_x2">Familiar x2 (10% descuento)</option>
                          <option value="familiar_x3">Familiar x3 (15% descuento)</option>
                        </select>
                        {(formularioRenovacion.duracion === 'semestral' || formularioRenovacion.duracion === 'anual') && 
                         formularioRenovacion.descuentoEspecial !== 'ninguno' && (
                          <div className={styles.warning}>
                            ⚠️ Los descuentos familiares no aplican a planes semestrales o anuales
                          </div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label>Monto (opcional):</label>
                        <input 
                          type="number" 
                          value={formularioRenovacion.monto || ''}
                          onChange={(e) => setFormularioRenovacion({...formularioRenovacion, monto: parseFloat(e.target.value) || 0})}
                          placeholder="Monto del plan (opcional)"
                          min="0"
                          step="100"
                        />
                        <small className={styles.helpText}>
                          Si se especifica un monto, se aplicará el descuento correspondiente
                        </small>
                      </div>

                      {formularioRenovacion.descuentoEspecial !== 'ninguno' && formularioRenovacion.monto > 0 && (
                        <div className={styles.descuentoInfo}>
                          <div className={styles.descuentoDetails}>
                            <span><strong>Monto original:</strong> ${formularioRenovacion.monto.toLocaleString('es-CL')}</span>
                            <span><strong>Descuento:</strong> {formularioRenovacion.descuentoEspecial === 'familiar_x2' ? '10%' : '15%'}</span>
                            <span className={styles.totalPagar}>
                              <strong>Total a pagar:</strong> ${(formularioRenovacion.monto * (formularioRenovacion.descuentoEspecial === 'familiar_x2' ? 0.9 : 0.85)).toLocaleString('es-CL')}
                            </span>
                          </div>
                        </div>
                      )}

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
