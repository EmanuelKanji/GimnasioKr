'use client';

import styles from './ListaAlumnosProfesor.module.css';
import { useState } from 'react';

import type { Alumno } from '../../../shared/types';

interface ListaAlumnosProfesorProps {
  alumnos: Alumno[];
  misAlumnos: Alumno[];
  agregarAlumno: (alumno: Alumno) => void;
  eliminarAlumno: (rut: string) => void;
  loading?: boolean;
}

export default function ListaAlumnosProfesor({ alumnos, misAlumnos, agregarAlumno, eliminarAlumno, loading = false }: ListaAlumnosProfesorProps) {
  const [rutSearch, setRutSearch] = useState('');
  const [nombreSearch, setNombreSearch] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Filtrar alumnos inscritos por nombre y rut
  const filteredInscritos = alumnos.filter(alumno => {
    const rutMatch = rutSearch 
      ? (alumno.rut || '').replace(/\.|-/g, '').toUpperCase().includes(rutSearch)
      : true;
    
    const nombreMatch = nombreSearch
      ? (alumno.nombre ?? '').toLowerCase().includes(nombreSearch.toLowerCase())
      : true;
    
    // Excluir los que ya están en "mis alumnos"
    const yaAgregado = misAlumnos.some(a => a.rut === alumno.rut);
    return rutMatch && nombreMatch && !yaAgregado;
  });

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Gestión de Mis Alumnos</h3>

      {/* Sección: Mis Alumnos Actuales */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Mis Alumnos Actuales</h4>
          <div className={styles.resultsInfo}>
            {misAlumnos.length} alumno{misAlumnos.length !== 1 ? 's' : ''} asignado{misAlumnos.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          {misAlumnos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <div className={styles.emptyText}>No tienes alumnos asignados</div>
              <div className={styles.emptySubtext}>Agrega alumnos desde la lista de inscritos más abajo</div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeader}>Nombre</th>
                    <th className={styles.tableHeader}>RUT</th>
                    <th className={styles.tableHeader}>Plan</th>
                    <th className={styles.tableHeader}>Inicio Plan</th>
                    <th className={styles.tableHeader}>Acción</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {misAlumnos.map((alumno, index) => (
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
                        <span className={styles.date}>
                          {formatDate(alumno.fechaInicioPlan)}
                        </span>
                      </td>
                      <td className={styles.tableCell} data-label="Acción">
                        <button 
                          onClick={() => eliminarAlumno(alumno.rut ?? '')} 
                          className={`${styles.actionButton} ${styles.eliminar}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sección: Buscar y Agregar Alumnos */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Buscar y Agregar Alumnos</h4>
          <div className={styles.resultsInfo}>
            {filteredInscritos.length} alumno{filteredInscritos.length !== 1 ? 's' : ''} disponible{filteredInscritos.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className={styles.searchContainer}>
          <p className={styles.searchSubtitle}>
            Encuentra alumnos inscritos en el sistema para agregarlos a tu lista personal
          </p>
          <div className={styles.searchInputs}>
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
                placeholder="Ej: Juan Pérez"
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingText}>Cargando alumnos disponibles...</div>
            </div>
          ) : filteredInscritos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyText}>
                {alumnos.length === 0 ? 'No hay alumnos inscritos' : 'No se encontraron alumnos'}
              </div>
              <div className={styles.emptySubtext}>
                {alumnos.length === 0 
                  ? 'No hay alumnos registrados en el sistema' 
                  : 'Intenta con otros términos de búsqueda o revisa si ya los tienes agregados'}
              </div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeader}>Nombre</th>
                    <th className={styles.tableHeader}>RUT</th>
                    <th className={styles.tableHeader}>Plan</th>
                    <th className={styles.tableHeader}>Inicio Plan</th>
                    <th className={styles.tableHeader}>Acción</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {filteredInscritos.map((alumno, index) => (
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
                        <span className={styles.date}>
                          {formatDate(alumno.fechaInicioPlan)}
                        </span>
                      </td>
                      <td className={styles.tableCell} data-label="Acción">
                        <button 
                          onClick={() => agregarAlumno(alumno)} 
                          className={`${styles.actionButton} ${styles.agregar}`}
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}