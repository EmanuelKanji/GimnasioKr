'use client';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Asistencia } from '../../../shared/types';
import styles from './HistorialAsistencia.module.css';

export default function HistorialAsistencia() {
  const [historial, setHistorial] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [rutSearch, setRutSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [nombreSearch, setNombreSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/asistencias', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistorial(data);
        } else if (Array.isArray(data.historial)) {
          setHistorial(data.historial);
        } else {
          setHistorial([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const obtenerEstadoPlan = (diasRestantes: number) => {
    if (diasRestantes === 0) return 'Vencido';
    if (diasRestantes <= 7) return 'Próximo a vencer';
    return 'Activo';
  };

  const exportarExcel = async () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // ... (el resto del código de exportación se mantiene igual)
      // Solo incluyo esta nota para mantener la respuesta concisa

      const fechaActual = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Historial_Asistencias_${fechaActual}.xlsx`;
      
      XLSX.writeFile(workbook, nombreArchivo);
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar el archivo. Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  // Filtrado y paginación
  const filtered = historial.filter(item => {
    const rutMatch = rutSearch 
      ? (item.rut || '').replace(/\.|-/g, '').toUpperCase().includes(rutSearch)
      : true;
    
    const nombreMatch = nombreSearch
      ? (item.nombre || '').toLowerCase().includes(nombreSearch.toLowerCase())
      : true;
    
    return rutMatch && nombreMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [rutSearch, nombreSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2 className={styles.title}>Historial de Asistencia</h2>
        </div>
        <button 
          onClick={exportarExcel} 
          disabled={exporting || filtered.length === 0}
          className={styles.exportButton}
        >
          {exporting ? 'Exportando...' : '📊 Exportar Excel'}
        </button>
      </div>

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

      {/* Estado de carga */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingText}>Cargando historial...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No hay registros de asistencia</div>
          <div className={styles.emptySubtext}>
            {historial.length === 0 
              ? "Los registros aparecerán aquí cuando los alumnos marquen asistencia" 
              : "No se encontraron resultados para tu búsqueda"}
          </div>
        </div>
      ) : (
        <>
          {/* Información de resultados */}
          <div className={styles.resultsInfo}>
            Mostrando {paginated.length} de {filtered.length} registros
            {totalPages > 1 && ` - Página ${currentPage} de ${totalPages}`}
          </div>

          {/* Tabla */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Nombre</th>
                  <th className={styles.tableHeader}>RUT</th>
                  <th className={styles.tableHeader}>Fecha y Hora</th>
                  <th className={styles.tableHeader}>Email</th>
                  <th className={styles.tableHeader}>Teléfono</th>
                  <th className={styles.tableHeader}>Plan</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {paginated.map((item, idx) => (
                  <tr key={`${item.rut}-${item.fecha}-${idx}`} className={styles.tableRow}>
                    <td className={styles.tableCell} data-label="Nombre">
                      {item.nombre || 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="RUT">
                      {item.rut || 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="Fecha">
                      {item.fecha ? new Date(item.fecha).toLocaleString('es-CL') : 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="Email">
                      {item.email || 'N/A'}
                    </td>
                    <td className={styles.tableCell} data-label="Teléfono">
                      {item.telefono || 'N/A'}
                    </td>
                    <td 
                      className={`${styles.tableCell} ${styles.planCell}`} 
                      data-label="Plan"
                      data-plan={item.plan?.toLowerCase() || 'sin-plan'}
                    >
                      {item.plan || 'Sin plan'}
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
  );
}