'use client';

import styles from './PerfilProfesor.module.css';

interface PerfilInfo {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
}



import { useState, useEffect } from 'react';

export default function PerfilProfesor() {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<PerfilInfo>({
    nombre: '',
    rut: '', // Se mostrará pero no se editará
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Obtener perfil al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Extraer rut del token JWT y depurar
    let rutFromToken = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload:', payload); // Depuración
      rutFromToken = payload.rut || '';
    } catch (e) {
      console.error('Error decodificando JWT:', e);
    }
    // Obtener datos del profesor
  fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject('Error al obtener perfil'))
      .then(data => {
        setForm({ ...data, rut: rutFromToken });
        setLoading(false);
      })
      .catch(() => {
        setForm(f => ({ ...f, rut: rutFromToken }));
        setError('No se pudo cargar el perfil');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'rut') return; // No permitir editar rut
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setEditMode(false);
    const token = localStorage.getItem('token');
    try {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      setSuccess('Información guardada correctamente');
      // Obtener perfil actualizado después del POST
  const perfilRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (perfilRes.ok) {
        const perfilData = await perfilRes.json();
        setForm(perfilData);
      }
    } catch {
      setError('No se pudo guardar la información');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi perfil</h2>
      {loading ? (
        <div>Cargando perfil...</div>
      ) : (
        <>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
          <div className={styles.perfilBox}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nombre:</span>
              {editMode ? (
                <input name="nombre" value={form.nombre} onChange={handleChange} className={styles.input} />
              ) : (
                <span>{form.nombre}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>RUT:</span>
              <input name="rut" value={form.rut} className={styles.input} readOnly />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Correo:</span>
              {editMode ? (
                <input name="email" value={form.email} onChange={handleChange} className={styles.input} />
              ) : (
                <span>{form.email}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Teléfono:</span>
              {editMode ? (
                <input name="telefono" value={form.telefono} onChange={handleChange} className={styles.input} />
              ) : (
                <span>{form.telefono}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Dirección:</span>
              {editMode ? (
                <input name="direccion" value={form.direccion} onChange={handleChange} className={styles.input} />
              ) : (
                <span>{form.direccion}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Fecha de nacimiento:</span>
              {editMode ? (
                <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} className={styles.input} />
              ) : (
                <span>{new Date(form.fechaNacimiento).toLocaleDateString('es-CL')}</span>
              )}
            </div>
          </div>
          {editMode ? (
            <button className={styles.editBtn} type="button" onClick={handleSave}>Guardar información</button>
          ) : (
            <button className={styles.editBtn} type="button" onClick={() => setEditMode(true)}>Editar información</button>
          )}
        </>
      )}
    </div>
  );
}

