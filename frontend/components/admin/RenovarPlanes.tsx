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
  const [procesandoRenovacion, setProcesandoRenovacion] = useState<string | null>(null);

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

  // Resetear formulario cuando se selecciona nuevo alumno
  useEffect(() => {
    if (alumnoSeleccionado) {
      setFormularioRenovacion({
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: calcularFechaFin(new Date().toISOString().split('T')[0], 'mensual'),
        duracion: 'mensual',
        limiteClases: 'todos_los_dias',
        observaciones: '',
        descuentoEspecial: 'ninguno',
        monto: 0
      });
    }
  }, [alumnoSeleccionado]);

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
      setProcesandoRenovacion(alumnoId);
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
        alert('✅ Plan renovado exitosamente');
        setAlumnoSeleccionado(null);
        cargarAlumnos();
      } else if (res.status === 401) {
        alert('Sesión expirada. Redirigiendo al login...');
        window.location.href = '/login-admin';
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error renovando plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      alert(`❌ Error al renovar plan: ${errorMessage}`);
    } finally {
      setProcesandoRenovacion(null);
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
      return { texto: 'Solicitud enviada', color: '#f59e0b', icono: '⏳', clase: styles.estadoSolicitada };
    } else if (diasRestantes < 0) {
      return { texto: 'Plan expirado', color: '#ef4444', icono: '❌', clase: styles.estadoExpirado };
    } else if (diasRestantes <= 3) {
      return { texto: `Termina en ${diasRestantes} días`, color: '#f59e0b', icono: '⚠️', clase: styles.estadoPorVencer };
    } else {
      return { texto: 'QR bloqueado', color: '#6b7280', icono: '🔒', clase: styles.estadoBloqueado };
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
        <div className={styles.loading}>
          <div className={styles.loadingText}>Cargando alumnos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🔄 Renovar Planes</h2>
        <div className={styles.resultsInfo}>
          {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} encontrado{alumnos.length !== 1 ? 's' : ''}
        </div>
      </div>
      
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
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyText}>No hay alumnos que requieran renovación</div>
            <div className={styles.emptySubtext}>
              {filtro === 'todos' 
                ? 'Todos los planes están activos y sin solicitudes pendientes'
                : `No hay alumnos que coincidan con el filtro "${filtro}"`}
            </div>
          </div>
        ) : (
          alumnos.map(alumno => {
            const estado = obtenerEstadoVisual(alumno);
            const diasRestantes = calcularDiasRestantes(alumno.fechaTerminoPlan);
            const estaProcesando = procesandoRenovacion === alumno._id;
            
            return (
              <div key={alumno._id} className={styles.alumnoCard}>
                <div className={styles.alumnoHeader}>
                  <div className={styles.alumnoInfo}>
                    <h3 className={styles.alumnoNombre}>{alumno.nombre}</h3>
                    <p className={styles.alumnoRut}>RUT: {alumno.rut}</p>
                    <div className={styles.alumnoDetails}>
                      <span className={styles.planBadge} data-plan={alumno.plan?.toLowerCase()}>
                        {alumno.plan}
                      </span>
                      <span className={styles.fechas}>
                        {new Date(alumno.fechaInicioPlan).toLocaleDateString('es-CL')} - {new Date(alumno.fechaTerminoPlan).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.estadoContainer}>
                    <span className={`${styles.estado} ${estado.clase}`}>
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
                    onClick={() => setAlumnoSeleccionado(alumnoSeleccionado === alumno._id ? null : alumno._id)}
                    className={styles.renovarBtn}
                    disabled={estaProcesando}
                  >
                    {estaProcesando ? '⏳ Procesando...' : '🔄 Renovar Plan'}
                  </button>
                </div>

                {/* Formulario de Renovación Expandido */}
                {alumnoSeleccionado === alumno._id && (
                  <div className={styles.formularioRenovacion}>
                    <div className={styles.formHeader}>
                      <h4>Renovar Plan para {alumno.nombre}</h4>
                      <button 
                        onClick={() => setAlumnoSeleccionado(null)}
                        className={styles.closeBtn}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <form onSubmit={(e) => { e.preventDefault(); handleRenovar(alumno._id); }}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Fecha de Inicio:</label>
                          <input 
                            type="date" 
                            value={formularioRenovacion.fechaInicio}
                            onChange={(e) => handleFechaInicioChange(e.target.value)}
                            className={styles.formInput}
                            required
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Duración:</label>
                          <select 
                            value={formularioRenovacion.duracion}
                            onChange={(e) => handleDuracionChange(e.target.value)}
                            className={styles.formSelect}
                          >
                            <option value="mensual">Mensual</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="semestral">Semestral (6 meses)</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Fecha de Término:</label>
                          <input 
                            type="date" 
                            value={formularioRenovacion.fechaFin}
                            readOnly
                            className={`${styles.formInput} ${styles.readOnlyInput}`}
                          />
                          <small className={styles.helpText}>
                            Calculada automáticamente según la duración
                          </small>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Límite de Clases:</label>
                          <select 
                            value={formularioRenovacion.limiteClases}
                            onChange={(e) => setFormularioRenovacion({...formularioRenovacion, limiteClases: e.target.value})}
                            className={styles.formSelect}
                          >
                            <option value="todos_los_dias">Todos los días</option>
                            <option value="12">12 clases/mes</option>
                            <option value="8">8 clases/mes</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Descuento Especial:</label>
                          <select 
                            value={formularioRenovacion.descuentoEspecial}
                            onChange={(e) => setFormularioRenovacion({...formularioRenovacion, descuentoEspecial: e.target.value})}
                            className={styles.formSelect}
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
                          <label className={styles.formLabel}>Monto (opcional):</label>
                          <input 
                            type="number" 
                            value={formularioRenovacion.monto || ''}
                            onChange={(e) => setFormularioRenovacion({...formularioRenovacion, monto: parseFloat(e.target.value) || 0})}
                            placeholder="Monto del plan"
                            className={styles.formInput}
                            min="0"
                            step="100"
                          />
                          <small className={styles.helpText}>
                            Si se especifica un monto, se aplicará el descuento correspondiente
                          </small>
                        </div>
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
                        <label className={styles.formLabel}>Observaciones:</label>
                        <textarea 
                          value={formularioRenovacion.observaciones}
                          onChange={(e) => setFormularioRenovacion({...formularioRenovacion, observaciones: e.target.value})}
                          placeholder="Notas sobre el pago o renovación..."
                          className={styles.formTextarea}
                          rows={3}
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button 
                          type="submit" 
                          className={styles.confirmarBtn}
                          disabled={estaProcesando}
                        >
                          {estaProcesando ? '⏳ Procesando...' : '✅ Confirmar Renovación'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAlumnoSeleccionado(null)}
                          className={styles.cancelarBtn}
                          disabled={estaProcesando}
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