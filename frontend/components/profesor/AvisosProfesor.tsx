'use client';

import styles from './AvisosProfesor.module.css';
import { useState, useEffect } from 'react';

import type { Aviso, Alumno } from '../../../shared/types';

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
    
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/avisos/profesor', {
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
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/avisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          mensaje,
          destinatarios: misAlumnos.map(a => {
            const rut = a.rut ?? '';
            const rutLimpio = rut.replace(/\.|-/g, '').toUpperCase();
            console.log(`📤 Enviando aviso a alumno: ${a.nombre} (${rutLimpio})`);
            return rutLimpio;
          }),
        }),
      });
      
      if (!res.ok) throw new Error('Error al enviar aviso');
      
      const nuevoAviso = await res.json();
      setAvisosLocal(prev => [nuevoAviso, ...prev]);
      setTitulo('');
      setMensaje('');
      } catch {
      setError('No se pudo enviar el aviso.');
    } finally {
      setEnviando(false);
    }
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Avisos y mensajes</h2>
      <form className={styles.formAviso} onSubmit={handleEnviarAviso}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.formGroup}>
          <label htmlFor="titulo" className={styles.label}>Título:</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            className={styles.input}
            placeholder="Ingresa el título del aviso"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="mensaje" className={styles.label}>Mensaje:</label>
          <textarea
            id="mensaje"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            required
            rows={3}
            className={styles.textarea}
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Alumnos destinatarios:</label>
          <div className={styles.destinatariosList}>
            {misAlumnos.length === 0 ? (
              <div className={styles.emptyDestinatarios}>
                No tienes alumnos agregados.
              </div>
            ) : (
              <ul className={styles.destinatariosUl}>
                {misAlumnos.map(al => (
                  <li key={al.rut} className={styles.destinatarioItem}>
                    {al.nombre} ({al.rut})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={enviando || !titulo.trim() || !mensaje.trim() || misAlumnos.length === 0} 
          className={styles.submitButton}
        >
          {enviando ? 'Enviando...' : 'Enviar aviso'}
        </button>
      </form>
      <div className={styles.inbox}>
        {avisosLocal.length === 0 && (
          <div className={styles.emptyState}>No tienes avisos nuevos.</div>
        )}
        {avisosLocal.map((aviso, idx) => (
          <div key={aviso._id || idx} className={`${styles.aviso} ${styles.noleido}`}>
            <div className={styles.avisoHeader}>
              <span className={styles.avisoTitle}>{aviso.titulo}</span>
              <span className={styles.avisoDate}>{aviso.fecha ? new Date(aviso.fecha).toLocaleDateString('es-CL') : 'Sin fecha'}</span>
            </div>
            <div className={styles.avisoMensaje}>{aviso.mensaje}</div>
            {aviso.destinatarios && aviso.destinatarios.length > 0 && (
              <div className={styles.avisoDestinatarios}>
                <strong>Para:</strong> {aviso.destinatarios.length} alumno(s)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
