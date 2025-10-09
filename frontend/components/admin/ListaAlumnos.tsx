'use client';
import { useEffect, useState } from 'react';
import styles from './ListaAlumnos.module.css';

interface Alumno {
  nombre: string;
  rut: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  plan: string;
  fechaInicioPlan: string;
  fechaTerminoPlan: string;
}

export default function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rutSearch, setRutSearch] = useState('');
  const [nombreSearch, setNombreSearch] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/alumnos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        let alumnosData = [];
        if (Array.isArray(data)) {
          alumnosData = data;
        } else if (Array.isArray(data.alumnos)) {
          alumnosData = data.alumnos;
        }
        
        setAlumnos(alumnosData);
        
        // Enviar avisos automáticos para planes próximos a vencer
        if (alumnosData.length > 0) {
          enviarAvisosAutomaticos(alumnosData);
        }
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getAlerta = (fechaTermino: string) => {
    if (!fechaTermino) return null;
    const hoy = new Date();
    const termino = new Date(fechaTermino);
    const diff = Math.ceil((termino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff <= 0) {
      return <span className={`${styles.alerta} ${styles.alertaVencido}`}>¡Plan Vencido!</span>;
    } else if (diff === 1) {
      return <span className={`${styles.alerta} ${styles.alertaUrgente}`}>¡Último día!</span>;
    } else if (diff <= 3) {
      return <span className={`${styles.alerta} ${styles.alertaUrgente}`}>¡Faltan {diff} días!</span>;
    } else if (diff <= 7) {
      return <span className={`${styles.alerta} ${styles.alertaAdvertencia}`}>¡Faltan {diff} días!</span>;
    }
    return null;
  };

  // Función para enviar avisos automáticos
  const enviarAvisosAutomaticos = async (alumnos: Alumno[]) => {
    const hoy = new Date();
    const alumnosParaAvisar = alumnos.filter(alumno => {
      if (!alumno.fechaTerminoPlan) return false;
      const termino = new Date(alumno.fechaTerminoPlan);
      const diff = Math.ceil((termino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 7 && diff > 0; // Solo planes que vencen en 7 días o menos
    });

    console.log(`🔔 Enviando avisos automáticos a ${alumnosParaAvisar.length} alumnos`);

    for (const alumno of alumnosParaAvisar) {
      try {
        await crearAvisoVencimiento(alumno);
      } catch (error) {
        console.log(`❌ No se pudo enviar aviso a ${alumno.nombre}:`, error);
      }
    }
  };

  // Función para crear avisos de vencimiento
  const crearAvisoVencimiento = async (alumno: Alumno) => {
    const hoy = new Date();
    const termino = new Date(alumno.fechaTerminoPlan);
    const diff = Math.ceil((termino.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    let titulo, mensaje, motivoAutomatico;
    
    if (diff === 1) {
      titulo = "Tu plan vence mañana";
      mensaje = `Hola ${alumno.nombre}, tu plan ${alumno.plan} vence mañana. Te recomendamos renovar para evitar interrupciones en tu entrenamiento.`;
      motivoAutomatico = "vencimiento_plan_1_dia";
    } else if (diff <= 3) {
      titulo = `Tu plan vence en ${diff} días`;
      mensaje = `Hola ${alumno.nombre}, tu plan ${alumno.plan} vence en ${diff} días. Te recomendamos renovar pronto para continuar con tu entrenamiento.`;
      motivoAutomatico = `vencimiento_plan_${diff}_dias`;
    } else {
      titulo = `Tu plan vence en ${diff} días`;
      mensaje = `Hola ${alumno.nombre}, tu plan ${alumno.plan} vence en ${diff} días. Considera renovar para mantener tu rutina de entrenamiento.`;
      motivoAutomatico = `vencimiento_plan_${diff}_dias`;
    }

    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        titulo,
        mensaje,
        destinatarios: [alumno.rut],
        tipo: 'automatico',
        motivoAutomatico
      })
    });

    if (res.ok) {
      console.log(`✅ Aviso enviado a ${alumno.nombre} (${diff} días restantes)`);
    } else {
      const errorData = await res.json();
      console.log(`⚠️ Error enviando aviso a ${alumno.nombre}:`, errorData);
    }
  };

  // Filtrado por RUT y nombre
  const filtered = alumnos.filter(alumno => {
    const rutMatch = rutSearch 
      ? (alumno.rut || '').replace(/\.|-/g, '').toUpperCase().includes(rutSearch)
      : true;
    
    const nombreMatch = nombreSearch
      ? (alumno.nombre || '').toLowerCase().includes(nombreSearch.toLowerCase())
      : true;
    
    return rutMatch && nombreMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reiniciar página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [rutSearch, nombreSearch]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Alumnos Inscritos</h3>
      
      {/* Búsquedas */}
      <div className={styles.searchContainer}>
        <div className={styles.searchGroup}>
          <label htmlFor="rut-search" className={styles.searchLabel}>
            Buscar por RUT:
          </label>
          <input
            id="rut-search"
            type="text"
            value={rutSearch}
            onChange={e => setRutSearch(e.target.value.replace(/\D/g, '').toUpperCase())}
            placeholder="Ej: 12345678K"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.searchGroup}>
          <label htmlFor="nombre-search" className={styles.searchLabel}>
            Buscar por Nombre:
          </label>
          <input
            id="nombre-search"
            type="text"
            value={nombreSearch}
            onChange={e => setNombreSearch(e.target.value)}
            placeholder="Ej: Juan"
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Información de resultados */}
      {!loading && filtered.length > 0 && (
        <div className={styles.resultsInfo}>
          Mostrando {paginated.length} de {filtered.length} alumnos
          {totalPages > 1 && ` - Página ${currentPage} de ${totalPages}`}
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingText}>Cargando alumnos...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <div className={styles.emptyText}>
              {alumnos.length === 0 ? 'No hay alumnos inscritos' : 'No se encontraron alumnos'}
            </div>
            <div className={styles.emptySubtext}>
              {alumnos.length === 0 
                ? 'Los alumnos aparecerán aquí cuando se registren en el sistema' 
                : 'Intenta con otros términos de búsqueda'}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeader}>Nombre</th>
                    <th className={styles.tableHeader}>RUT</th>
                    <th className={styles.tableHeader}>Plan</th>
                    <th className={styles.tableHeader}>Inicio</th>
                    <th className={styles.tableHeader}>Término</th>
                    <th className={styles.tableHeader}>Alerta</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {paginated.map((alumno, index) => (
                    <tr key={index} className={styles.tableRow}>
                      <td className={styles.tableCell} data-label="Nombre">
                        {alumno.nombre}
                      </td>
                      <td className={styles.tableCell} data-label="RUT">
                        {alumno.rut}
                      </td>
                      <td className={styles.tableCell} data-label="Plan">
                        <span 
                          className={styles.planBadge} 
                          data-plan={alumno.plan?.toLowerCase()}
                        >
                          {alumno.plan}
                        </span>
                      </td>
                      <td className={styles.tableCell} data-label="Inicio">
                        <span className={styles.date}>{formatDate(alumno.fechaInicioPlan)}</span>
                      </td>
                      <td className={styles.tableCell} data-label="Término">
                        <span className={styles.date}>{formatDate(alumno.fechaTerminoPlan)}</span>
                      </td>
                      <td className={styles.tableCell} data-label="Alerta">
                        {getAlerta(alumno.fechaTerminoPlan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Primera
                </button>
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                
                <span className={styles.paginationInfo}>
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Última
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}