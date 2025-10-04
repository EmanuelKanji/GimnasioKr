'use client';

import styles from './ListaAlumnosProfesor.module.css';
import { useEffect, useState } from 'react';

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
    let rutOk = true;
    let nombreOk = true;
    if (rutSearch) {
      const cleanRut = (alumno.rut || '').replace(/\.|-/g, '').toUpperCase();
      rutOk = cleanRut.includes(rutSearch);
    }
    if (nombreSearch) {
      nombreOk = (alumno.nombre ?? '').toLowerCase().includes(nombreSearch.toLowerCase());
    }
    // Excluir los que ya están en "mis alumnos"
    const yaAgregado = misAlumnos.some(a => a.rut === alumno.rut);
    return rutOk && nombreOk && !yaAgregado;
  });


  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Mis alumnos</h3>
      {/* Listado de mis alumnos */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Nombre</th>
              <th className={styles.tableHeader}>RUT</th>
              <th className={styles.tableHeader}>Plan</th>
              <th className={styles.tableHeader}>Inicio</th>
              <th className={styles.tableHeader}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {misAlumnos.map((alumno, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell} data-label="Nombre">{alumno.nombre}</td>
                <td className={styles.tableCell} data-label="RUT">{alumno.rut}</td>
                <td className={styles.tableCell} data-label="Plan"><span className={styles.planBadge}>{alumno.plan}</span></td>
                <td className={styles.tableCell} data-label="Inicio"><span className={styles.date}>{formatDate(alumno.fechaInicioPlan)}</span></td>
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
            {misAlumnos.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyStateCell}>No has agregado alumnos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Buscador y listado de alumnos inscritos */}
      <div className={styles.searchContainer}>
        <h4 className={styles.searchTitle}>Buscar y agregar alumnos inscritos</h4>
        <p className={styles.searchSubtitle}>Encuentra alumnos inscritos para agregarlos a tu lista</p>
        <div className={styles.searchInputs}>
          <div className={styles.searchGroup}>
            <label htmlFor="rut-search" className={styles.searchLabel}>Buscar por RUT:</label>
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
            <label htmlFor="nombre-search" className={styles.searchLabel}>Buscar por Nombre:</label>
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
      </div>
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>Cargando alumnos...</div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeader}>Nombre</th>
                <th className={styles.tableHeader}>RUT</th>
                <th className={styles.tableHeader}>Plan</th>
                <th className={styles.tableHeader}>Inicio</th>
                <th className={styles.tableHeader}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredInscritos.map((alumno, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.tableCell} data-label="Nombre">{alumno.nombre}</td>
                  <td className={styles.tableCell} data-label="RUT">{alumno.rut}</td>
                  <td className={styles.tableCell} data-label="Plan"><span className={styles.planBadge}>{alumno.plan}</span></td>
                  <td className={styles.tableCell} data-label="Inicio"><span className={styles.date}>{formatDate(alumno.fechaInicioPlan)}</span></td>
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
              {filteredInscritos.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyStateCell}>No hay alumnos para agregar.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
