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

  // Funciones helper para manejar planes
  const obtenerDuracionPlan = (plan: string) => {
    const duraciones: { [key: string]: string } = {
      'PM 2X': 'mensual',
      'PM 3X': 'mensual', 
      'FULL': 'mensual',
      'ESTUDIANTES': 'mensual',
      'TRIMESTRAL 12 CLASES': 'trimestral',
      'TRIMESTRAL FULL': 'trimestral',
      'AM FULL': 'mensual'
    };
    return duraciones[plan] || 'mensual';
  };

  const obtenerLimiteClases = (plan: string) => {
    const limites: { [key: string]: string } = {
      'PM 2X': '8',
      'PM 3X': '12',
      'FULL': 'todos_los_dias',
      'ESTUDIANTES': 'todos_los_dias',
      'TRIMESTRAL 12 CLASES': '12',
      'TRIMESTRAL FULL': 'todos_los_dias',
      'AM FULL': 'todos_los_dias'
    };
    return limites[plan] || 'todos_los_dias';
  };

  const obtenerDescripcionLimite = (plan: string) => {
    const descripciones: { [key: string]: string } = {
      'PM 2X': '8 clases/mes',
      'PM 3X': '12 clases/mes',
      'FULL': 'Todos los días',
      'ESTUDIANTES': 'Todos los días',
      'TRIMESTRAL 12 CLASES': '12 clases/mes',
      'TRIMESTRAL FULL': 'Todos los días',
      'AM FULL': 'Todos los días (solo mañanas)'
    };
    return descripciones[plan] || 'Todos los días';
  };

  const obtenerPorcentajeDescuento = (descuento: string) => {
    const porcentajes: { [key: string]: string } = {
      'familiar_x2': '10%',
      'familiar_x3': '15%'
    };
    return porcentajes[descuento] || '0%';
  };

  const [formularioRenovacion, setFormularioRenovacion] = useState({
    planSeleccionado: '',
    descuentoEspecial: 'ninguno',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    observaciones: ''
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
        planSeleccionado: '',
        descuentoEspecial: 'ninguno',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        observaciones: ''
      });
    }
  }, [alumnoSeleccionado]);

  // Manejar cambios en el formulario
  const handlePlanChange = (planSeleccionado: string) => {
    const duracion = obtenerDuracionPlan(planSeleccionado);
    const fechaFin = calcularFechaFin(formularioRenovacion.fechaInicio, duracion);
    setFormularioRenovacion({
      ...formularioRenovacion,
      planSeleccionado,
      fechaFin
    });
  };

  // Manejar cambio de fecha de inicio para recalcular fecha fin
  const handleFechaInicioChange = (fechaInicio: string) => {
    if (formularioRenovacion.planSeleccionado) {
      const duracion = obtenerDuracionPlan(formularioRenovacion.planSeleccionado);
      const fechaFin = calcularFechaFin(fechaInicio, duracion);
      
      setFormularioRenovacion({
        ...formularioRenovacion,
        fechaInicio,
        fechaFin
      });
    }
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
      if (!formularioRenovacion.planSeleccionado) {
        alert('Por favor selecciona un plan para la renovación');
        return;
      }

      // Obtener duración y límite del plan seleccionado
      const duracion = obtenerDuracionPlan(formularioRenovacion.planSeleccionado);
      const limiteClases = obtenerLimiteClases(formularioRenovacion.planSeleccionado);
      const fechaFin = calcularFechaFin(formularioRenovacion.fechaInicio, duracion);

      // Preparar datos para el backend
      const datosRenovacion = {
        plan: formularioRenovacion.planSeleccionado,
        fechaInicio: formularioRenovacion.fechaInicio,
        fechaFin: fechaFin,
        duracion: duracion,
        limiteClases: limiteClases,
        observaciones: formularioRenovacion.observaciones || '',
        descuentoEspecial: formularioRenovacion.descuentoEspecial
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
        
        // Notificar que el perfil del alumno se ha actualizado
        // Esto hará que el dashboard del alumno se actualice automáticamente
        window.dispatchEvent(new CustomEvent('perfilActualizado', { 
          detail: { data: responseData.alumno, timestamp: Date.now() } 
        }));
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
                        {/* Plan de Renovación */}
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Plan de Renovación:</label>
                          <select 
                            value={formularioRenovacion.planSeleccionado}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            className={styles.formSelect}
                            required
                          >
                            <option value="">Seleccionar plan...</option>
                            <option value="PM 2X">PM 2X - 8 clases/mes</option>
                            <option value="PM 3X">PM 3X - 12 clases/mes</option>
                            <option value="FULL">FULL - Todos los días</option>
                            <option value="ESTUDIANTES">ESTUDIANTES - Descuento estudiantil</option>
                            <option value="TRIMESTRAL 12 CLASES">TRIMESTRAL 12 CLASES</option>
                            <option value="TRIMESTRAL FULL">TRIMESTRAL FULL</option>
                            <option value="AM FULL">AM FULL - Mañanas</option>
                          </select>
                        </div>

                        {/* Descuento Especial */}
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Descuento Especial:</label>
                          <select 
                            value={formularioRenovacion.descuentoEspecial}
                            onChange={(e) => setFormularioRenovacion({...formularioRenovacion, descuentoEspecial: e.target.value})}
                            className={styles.formSelect}
                          >
                            <option value="ninguno">Sin descuento especial</option>
                            <option value="familiar_x2">Familiar x2 (10% descuento)</option>
                            <option value="familiar_x3">Familiar x3 (15% descuento)</option>
                          </select>
                        </div>

                        {/* Fecha de Inicio (editable) */}
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Fecha de Inicio:</label>
                          <input 
                            type="date" 
                            value={formularioRenovacion.fechaInicio}
                            onChange={(e) => handleFechaInicioChange(e.target.value)}
                            min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 30 días atrás
                            max={new Date().toISOString().split('T')[0]} // Máximo hoy
                            className={styles.formInput}
                          />
                          <small className={styles.helpText}>
                            Puedes seleccionar una fecha hasta 30 días atrás
                          </small>
                        </div>

                        {/* Fecha de Término (calculada automáticamente) */}
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Fecha de Término:</label>
                          <input 
                            type="date" 
                            value={formularioRenovacion.fechaFin}
                            readOnly
                            className={`${styles.formInput} ${styles.readOnlyInput}`}
                          />
                          <small className={styles.helpText}>
                            Calculada automáticamente según el plan seleccionado
                          </small>
                        </div>
                      </div>

                      {/* Información del Plan y Descuento */}
                      {formularioRenovacion.planSeleccionado && (
                        <div className={styles.planInfo}>
                          <h4>📋 Información del Plan</h4>
                          <div className={styles.planDetails}>
                            <span><strong>Plan:</strong> {formularioRenovacion.planSeleccionado}</span>
                            <span><strong>Duración:</strong> {obtenerDuracionPlan(formularioRenovacion.planSeleccionado)}</span>
                            <span><strong>Límite de clases:</strong> {obtenerDescripcionLimite(formularioRenovacion.planSeleccionado)}</span>
                            {formularioRenovacion.descuentoEspecial !== 'ninguno' && (
                              <span className={styles.descuentoAplicado}>
                                <strong>Descuento aplicado:</strong> {obtenerPorcentajeDescuento(formularioRenovacion.descuentoEspecial)}
                              </span>
                            )}
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
                          disabled={estaProcesando || !formularioRenovacion.planSeleccionado}
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