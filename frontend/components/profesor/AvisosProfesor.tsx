'use client';

export interface Aviso {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}
import styles from './AvisosProfesor.module.css';
import { useState, useEffect } from 'react';

import type { Alumno } from '../../../shared/types';

interface AvisosProfesorProps {
  misAlumnos: Alumno[];
}

export default function AvisosProfesor({ misAlumnos = [] }: AvisosProfesorProps) {

// Recibe los alumnos de "mis alumnos" como prop
  const [avisosLocal, setAvisosLocal] = useState<Aviso[]>([]);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Obtener avisos del profesor al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:4000/api/avisos/profesor', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject('Error al obtener avisos'))
      .then(data => {
        setAvisosLocal(Array.isArray(data) ? data : []);
      })
      .catch(() => setAvisosLocal([]));
  }, []);

  // Enviar aviso a todos los alumnos de "mis alumnos"
  const handleEnviarAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!titulo.trim() || !mensaje.trim() || misAlumnos.length === 0) return;
    setEnviando(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:4000/api/avisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          mensaje,
          destinatarios: misAlumnos.map(a => (a.rut ?? '').replace(/\.|-/g, '').toUpperCase()),
        }),
      });
      if (!res.ok) throw new Error('Error al enviar aviso');
      const nuevoAviso = await res.json();
      setAvisosLocal(prev => [nuevoAviso, ...prev]);
      setTitulo('');
      setMensaje('');
    } catch (err) {
      setError('No se pudo enviar el aviso.');
    }
    setEnviando(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Avisos y mensajes</h2>
      <form className={styles.formAviso} onSubmit={handleEnviarAviso} style={{ marginBottom: '2rem' }}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="titulo">Título:</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="mensaje">Mensaje:</label>
          <textarea
            id="mensaje"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            required
            rows={3}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Alumnos destinatarios:</label>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {misAlumnos.length === 0 ? (
              <li style={{ color: 'gray' }}>No tienes alumnos agregados.</li>
            ) : (
              misAlumnos.map(al => <li key={al.rut}>{al.nombre} ({al.rut})</li>)
            )}
          </ul>
        </div>
        <button type="submit" disabled={enviando || !titulo.trim() || !mensaje.trim() || misAlumnos.length === 0} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}>
          {enviando ? 'Enviando...' : 'Enviar aviso'}
        </button>
      </form>
      <div className={styles.inbox}>
        {avisosLocal.length === 0 && (
          <div className={styles.emptyState}>No tienes avisos nuevos.</div>
        )}
        {avisosLocal.map((aviso, idx) => (
          <div key={aviso.id || idx} className={`${styles.aviso} ${aviso.leido ? styles.leido : styles.noleido}`}>
            <div className={styles.avisoHeader}>
              <span className={styles.avisoTitle}>{aviso.titulo}</span>
              <span className={styles.avisoDate}>{new Date(aviso.fecha).toLocaleDateString('es-CL')}</span>
            </div>
            <div className={styles.avisoMensaje}>{aviso.mensaje}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
