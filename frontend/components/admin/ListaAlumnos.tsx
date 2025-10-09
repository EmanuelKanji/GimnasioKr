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
        if (Array.isArray(data)) {
          setAlumnos(data);
        } else if (Array.isArray(data.alumnos)) {
          setAlumnos(data.alumnos);
        } else {
          setAlumnos([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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