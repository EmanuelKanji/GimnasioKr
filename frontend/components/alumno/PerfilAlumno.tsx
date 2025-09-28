import styles from './PerfilAlumno.module.css';
import { useEffect, useState } from 'react';

interface PerfilInfo {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
}

export default function PerfilAlumno() {
  const [perfil, setPerfil] = useState<PerfilInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // El backend obtiene el rut desde el token y devuelve solo el perfil del alumno autenticado
    fetch('http://localhost:4000/api/alumnos/me/perfil', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setPerfil(data.perfil || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}>Cargando perfil...</div>;
  if (!perfil) return <div className={styles.container}>No se encontró el perfil.</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi perfil</h2>
      <div className={styles.perfilBox}>
        <div className={styles.infoRow}><span className={styles.label}>Nombre:</span> {perfil.nombre}</div>
        <div className={styles.infoRow}><span className={styles.label}>RUT:</span> {perfil.rut}</div>
        <div className={styles.infoRow}><span className={styles.label}>Correo:</span> {perfil.email}</div>
        <div className={styles.infoRow}><span className={styles.label}>Teléfono:</span> {perfil.telefono}</div>
        <div className={styles.infoRow}><span className={styles.label}>Dirección:</span> {perfil.direccion}</div>
        <div className={styles.infoRow}><span className={styles.label}>Fecha de nacimiento:</span> {new Date(perfil.fechaNacimiento).toLocaleDateString('es-CL')}</div>
      </div>
      <button className={styles.editBtn} type="button">Editar información</button>
    </div>
  );
}
