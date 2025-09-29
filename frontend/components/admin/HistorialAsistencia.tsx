'use client';
import { useEffect, useState } from 'react';
import styles from './HistorialAsistencia.module.css';

export default function HistorialAsistencia() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rutSearch, setRutSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
    const [nombreSearch, setNombreSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/asistencias', {
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

  // Filtrado y paginación
  const filtered = historial.filter(item => {
    let rutOk = true;
    let nombreOk = true;
    if (rutSearch) {
      const cleanRut = (item.rut || '').replace(/\.|-/g, '').toUpperCase();
      rutOk = cleanRut.includes(rutSearch);
    }
    if (nombreSearch) {
      nombreOk = (item.nombre || '').toLowerCase().includes(nombreSearch.toLowerCase());
    }
    return rutOk && nombreOk;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reiniciar página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [rutSearch]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Asistencia</h2>
      <div className={styles.searchBox} style={{ marginBottom: '1.5rem' }}>
      <div className={styles.searchBox} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label htmlFor="rut-search" style={{ marginRight: '0.5rem' }}>Buscar por RUT (sin puntos ni guion):</label>
          <input
            id="rut-search"
            type="text"
            value={rutSearch}
            onChange={e => setRutSearch(e.target.value.replace(/\D/g, '').toUpperCase())}
            placeholder="Ej: 12345678K"
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '180px' }}
          />
        </div>
        <div>
          <label htmlFor="nombre-search" style={{ marginRight: '0.5rem' }}>Buscar por Nombre:</label>
          <input
            id="nombre-search"
            type="text"
            value={nombreSearch}
            onChange={e => setNombreSearch(e.target.value)}
            placeholder="Ej: Juan"
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '180px' }}
          />
        </div>
      </div>
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingText}>Cargando historial...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No hay registros de asistencia</div>
          <div className={styles.emptySubtext}>Los registros aparecerán aquí cuando los alumnos marquen asistencia</div>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Fecha</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.nombre}</td>
                  <td>{item.rut}</td>
                  <td>{new Date(item.fecha).toLocaleString()}</td>
                  <td>{item.email}</td>
                  <td>{item.telefono}</td>
                  <td data-plan={item.plan?.toLowerCase()}>{item.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >Siguiente</button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}