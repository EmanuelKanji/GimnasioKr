'use client';
import type { Alumno, Plan } from '../../../shared/types';
import { useState, useEffect } from 'react';
import styles from './InscribirAlumno.module.css';


export default function InscribirAlumnoForm() {
  const [form, setForm] = useState<Alumno>({
    nombre: '',
    telefono: '',
    rut: '',
    direccion: '',
    fechaNacimiento: '',
    plan: 'mensual',
    fechaInicioPlan: '',
    duracion: 'mensual',
    monto: 0,
    password: '',
    email: '',
    limiteClases: 'todos_los_dias',
  });
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  // Cargar planes disponibles al montar el componente
  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/planes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          if (Array.isArray(data)) {
            setPlanes(data);
          } else if (Array.isArray(data.planes)) {
            setPlanes(data.planes);
          } else {
            setPlanes([]);
          }
        }
      } catch (error) {
        console.error('Error cargando planes:', error);
      } finally {
        setLoadingPlanes(false);
      }
    };

    cargarPlanes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'monto') {
      setForm({ ...form, monto: Number(e.target.value) });
    } else if (e.target.name === 'plan') {
      const planId = e.target.value;
      const planSeleccionado = planes.find(plan => plan._id === planId);
      if (planSeleccionado) {
        setForm({ 
          ...form, 
          plan: planSeleccionado.nombre,
          duracion: planSeleccionado.duracion,
          monto: planSeleccionado.precio,
          limiteClases: planSeleccionado.limiteClases || 'todos_los_dias'
        });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      const token = localStorage.getItem('token');
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data)) {
          setAlumnos(data);
        } else if (Array.isArray(data.alumnos)) {
          setAlumnos(data.alumnos);
        } else {
          setAlumnos([...alumnos, form]);
        }
        setMensaje('Alumno inscrito exitosamente.');
        setForm({
          nombre: '',
          telefono: '',
          rut: '',
          direccion: '',
          fechaNacimiento: '',
          plan: 'mensual',
          fechaInicioPlan: '',
          duracion: 'mensual',
          monto: 0,
          password: '',
          email: '',
          limiteClases: 'todos_los_dias',
        });
      } else {
        setMensaje(data.message || 'Error al inscribir alumno.');
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor.');
    }
  };


  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Inscribir Alumno</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="text"
          name="rut"
          placeholder="RUT"
          value={form.rut}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="date"
          name="fechaNacimiento"
          placeholder="Fecha de nacimiento"
          value={form.fechaNacimiento}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <select
          name="plan"
          value={planes.find(p => p.nombre === form.plan)?._id || ''}
          onChange={handleChange}
          className={styles.select}
          required
          disabled={loadingPlanes}
        >
          <option value="">
            {loadingPlanes ? 'Cargando planes...' : 'Selecciona un plan'}
          </option>
          {planes.map((plan) => (
            <option key={plan._id} value={plan._id}>
              {plan.nombre} - ${plan.precio?.toLocaleString()} ({plan.duracion})
            </option>
          ))}
        </select>
        <input
          type="number"
          name="monto"
          placeholder="Monto del plan (se llena automáticamente)"
          value={form.monto}
          onChange={handleChange}
          className={styles.input}
          readOnly
          style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
        />
        {form.plan && (
          <div className={styles.planInfo}>
            <h4 className={styles.planInfoTitle}>Información del Plan Seleccionado:</h4>
            <div className={styles.planDetails}>
              <span><strong>Plan:</strong> {form.plan}</span>
              <span><strong>Duración:</strong> {form.duracion}</span>
              <span><strong>Precio:</strong> ${form.monto?.toLocaleString()}</span>
              <span><strong>Límite:</strong> {form.limiteClases === '12' ? '12 clases al mes' : 
                                           form.limiteClases === '8' ? '8 clases al mes' : 'Todos los días hábiles'}</span>
            </div>
          </div>
        )}
        <input
          type="date"
          name="fechaInicioPlan"
          placeholder="Fecha de inicio del plan"
          value={form.fechaInicioPlan}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>
          Inscribir Alumno
        </button>
        {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
      </form>
    </div>
  );
}
