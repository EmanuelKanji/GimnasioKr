'use client';
import { useState, useEffect } from 'react';
import styles from './GestionarPlanes.module.css';
import type { Plan } from '../../../shared/types';

export default function GestionarPlanes() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', precio: '', clases: '12', matricula: '', duracion: 'mensual' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMensaje('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }
    
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/planes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          setMensaje('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          if (Array.isArray(data)) {
            setPlanes(data);
          } else if (Array.isArray(data.planes)) {
            setPlanes(data.planes);
          } else {
            setPlanes([]);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar planes:', error);
        setMensaje('Error de conexión con el servidor.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/planes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nuevo.nombre,
          descripcion: nuevo.descripcion,
          precio: Number(nuevo.precio),
          clases: nuevo.clases,
          matricula: nuevo.matricula,
          duracion: nuevo.duracion
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPlanes([...planes, data]);
        setMensaje('Plan creado exitosamente.');
        setNuevo({ nombre: '', descripcion: '', precio: '', clases: '12', matricula: '', duracion: 'mensual' });
      } else if (res.status === 401) {
        setMensaje('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Opcional: redirigir al login
        // window.location.href = '/login-admin';
      } else {
        setMensaje(data.message || data.error || 'Error al crear el plan.');
      }
    } catch (error) {
      console.error('Error al crear plan:', error);
      setMensaje('Error de conexión con el servidor.');
    }
  };

  const handleDelete = async (id: string) => {
    setMensaje(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }
    
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/planes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setPlanes(planes.filter(plan => plan._id !== id));
        setMensaje('Plan eliminado correctamente.');
      } else if (res.status === 401) {
        setMensaje('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Opcional: redirigir al login
        // window.location.href = '/login-admin';
      } else {
        const data = await res.json();
        setMensaje(data.message || data.error || 'Error al eliminar el plan.');
      }
    } catch (error) {
      console.error('Error al eliminar plan:', error);
      setMensaje('Error de conexión con el servidor.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestionar Planes de Suscripción</h2>
  <form onSubmit={handleAdd} className={styles.form}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del plan"
          value={nuevo.nombre}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={nuevo.descripcion}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={nuevo.precio}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <select
          name="clases"
          value={nuevo.clases}
          onChange={handleChange}
          className={styles.input}
          required
        >
          <option value="12">12 clases al mes</option>
          <option value="8">8 clases al mes</option>
          <option value="todos_los_dias">Todos los días hábiles</option>
        </select>
        <input
          type="text"
          name="matricula"
          placeholder="Matrícula"
          value={nuevo.matricula}
          onChange={handleChange}
          className={styles.input}
        />
        <select
          name="duracion"
          value={nuevo.duracion}
          onChange={handleChange}
          className={styles.input}
          required
        >
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="semestral">Semestral</option>
          <option value="anual">Anual</option>
        </select>
        <button type="submit" className={styles.submitButton}>
          Agregar Plan
        </button>
      </form>
      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
      {loading ? (
        <p>Cargando planes...</p>
      ) : (
        <ul className={styles.planesList}>
          {planes.map((plan) => (
            <li key={plan._id} className={styles.planItem}>
              <div className={styles.planInfo}>
                <div className={styles.planName}>{plan.nombre}</div>
                {plan.descripcion && <div className={styles.planDescription}>{plan.descripcion}</div>}
                <div className={styles.planDetails}>
                  <span>Límite: {plan.clases === '12' ? '12 clases al mes' : 
                                 plan.clases === '8' ? '8 clases al mes' : 'Todos los días hábiles'}</span>
                  <span>Precio: ${plan.precio?.toLocaleString()}</span>
                  <span>Matrícula: {plan.matricula}</span>
                </div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(plan._id)}
                type="button"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
