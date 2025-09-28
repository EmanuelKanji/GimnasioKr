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

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Alumnos Inscritos</h3>
      <div className={styles.tableContainer}>
        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
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
              {alumnos.map((alumno, index) => (
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
              {alumnos.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyStateCell}>
                    No hay alumnos inscritos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
