
'use client';
import { useState } from 'react';
import styles from './InscribirAlumno.module.css';

interface Alumno {
  nombre: string;
  rut: string;
  direccion: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  plan: string;
  fechaInicioPlan: string;
}

export default function InscribirAlumnoForm() {
  const [form, setForm] = useState<any>({
    nombre: '',
    email: '',
    telefono: '',
    rut: '',
    direccion: '',
    fechaNacimiento: '',
    plan: 'mensual',
    fechaInicioPlan: '',
    duracion: 'mensual',
    monto: '',
    password: '',
  });
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'plan') {
      setForm((prev: any) => ({ ...prev, duracion: e.target.value }));
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
          email: '',
          telefono: '',
          rut: '',
          direccion: '',
          fechaNacimiento: '',
          plan: 'mensual',
          fechaInicioPlan: '',
          duracion: 'mensual',
          monto: '',
          password: '',
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
