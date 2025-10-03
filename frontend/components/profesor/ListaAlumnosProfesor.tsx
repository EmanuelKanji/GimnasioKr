'use client';

import styles from './ListaAlumnosProfesor.module.css';
import mobileStyles from './ListaAlumnosProfesor-mobile.module.css';
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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const currentStyles = isMobile ? mobileStyles : styles;

  return (
    <div className={currentStyles.container}>
      <h3 className={currentStyles.title}>Mis alumnos</h3>
      {/* Listado de mis alumnos */}
      <div className={currentStyles.tableContainer}>
        <table className={currentStyles.table}>
          <thead className={currentStyles.tableHead}>
            <tr>
              <th className={currentStyles.tableHeader}>Nombre</th>
              <th className={currentStyles.tableHeader}>RUT</th>
              <th className={currentStyles.tableHeader}>Plan</th>
              <th className={currentStyles.tableHeader}>Inicio</th>
              <th className={currentStyles.tableHeader}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {misAlumnos.map((alumno, index) => (
              <tr key={index} className={currentStyles.tableRow}>
                <td className={currentStyles.tableCell} data-label="Nombre">{alumno.nombre}</td>
                <td className={currentStyles.tableCell} data-label="RUT">{alumno.rut}</td>
                <td className={currentStyles.tableCell} data-label="Plan"><span className={currentStyles.planBadge}>{alumno.plan}</span></td>
                <td className={currentStyles.tableCell} data-label="Inicio"><span className={currentStyles.date}>{formatDate(alumno.fechaInicioPlan)}</span></td>
                <td className={currentStyles.tableCell} data-label="Acción">
                  <button onClick={() => eliminarAlumno(alumno.rut ?? '')} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {misAlumnos.length === 0 && (
              <tr>
                <td colSpan={5} className={currentStyles.emptyStateCell}>No has agregado alumnos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Buscador y listado de alumnos inscritos */}
      <h4 style={{ marginTop: '2rem' }}>Buscar y agregar alumnos inscritos</h4>
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
      <div className={currentStyles.tableContainer}>
        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <table className={currentStyles.table}>
            <thead className={currentStyles.tableHead}>
              <tr>
                <th className={currentStyles.tableHeader}>Nombre</th>
                <th className={currentStyles.tableHeader}>RUT</th>
                <th className={currentStyles.tableHeader}>Plan</th>
                <th className={currentStyles.tableHeader}>Inicio</th>
                <th className={currentStyles.tableHeader}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredInscritos.map((alumno, index) => (
                <tr key={index} className={currentStyles.tableRow}>
                  <td className={currentStyles.tableCell} data-label="Nombre">{alumno.nombre}</td>
                  <td className={currentStyles.tableCell} data-label="RUT">{alumno.rut}</td>
                  <td className={currentStyles.tableCell} data-label="Plan"><span className={currentStyles.planBadge}>{alumno.plan}</span></td>
                  <td className={currentStyles.tableCell} data-label="Inicio"><span className={currentStyles.date}>{formatDate(alumno.fechaInicioPlan)}</span></td>
                  <td className={currentStyles.tableCell} data-label="Acción">
                    <button onClick={() => agregarAlumno(alumno)} style={{ color: 'green', border: 'none', background: 'none', cursor: 'pointer' }}>Agregar</button>
                  </td>
                </tr>
              ))}
              {filteredInscritos.length === 0 && (
                <tr>
                  <td colSpan={5} className={currentStyles.emptyStateCell}>No hay alumnos para agregar.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
