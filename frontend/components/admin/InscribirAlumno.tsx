'use client';
import type { Alumno } from '../../../shared/types';
import { useState } from 'react';
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
  });
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'monto') {
      setForm({ ...form, monto: Number(e.target.value) });
    } else if (e.target.name === 'plan') {
      setForm({ ...form, plan: e.target.value, duracion: e.target.value });
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
      const res = await fetch('http://localhost:4000/api/alumnos', {
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
        <input
          type="number"
          name="monto"
          placeholder="Monto del plan"
          value={form.monto}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <select
          name="plan"
          value={form.plan}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </select>
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
