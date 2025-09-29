'use client';
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

import { useEffect, useState } from 'react';

export default function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rutSearch, setRutSearch] = useState('');
  const [nombreSearch, setNombreSearch] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/alumnos', {
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
    if (diff === 7) return <span className={styles.alerta}>¡Faltan 7 días!</span>;
    if (diff === 3) return <span className={styles.alerta}>¡Faltan 3 días!</span>;
    if (diff === 1) return <span className={styles.alerta}>¡Último día!</span>;
    return null;
  };


  // Filtrado por RUT y nombre
  const filtered = alumnos.filter(alumno => {
    let rutOk = true;
    let nombreOk = true;
    if (rutSearch) {
      const cleanRut = (alumno.rut || '').replace(/\.|-/g, '').toUpperCase();
      rutOk = cleanRut.includes(rutSearch);
    }
    if (nombreSearch) {
      nombreOk = alumno.nombre.toLowerCase().includes(nombreSearch.toLowerCase());
    }
    return rutOk && nombreOk;
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
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label htmlFor="rut-search" style={{ marginRight: '0.5rem' }}>Buscar por RUT:</label>
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
      <div className={styles.tableContainer}>
        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <>
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
              <tbody>
                {paginated.map((alumno, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.tableCell} data-label="Nombre">
                      {alumno.nombre}
                    </td>
                    <td className={styles.tableCell} data-label="RUT">
                      {alumno.rut}
                    </td>
                    <td className={styles.tableCell} data-label="Plan">
                      <span className={styles.planBadge}>{alumno.plan}</span>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyStateCell}>
                      No hay alumnos inscritos.
                    </td>
                  </tr>
                )}
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
          </>
        )}
      </div>
    </div>
  );
}
