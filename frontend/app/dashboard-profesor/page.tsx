"use client";
import { useState } from "react";
import styles from "./dashboard-profesor.module.css";
import ResumenProfesor from "../../components/profesor/ResumenProfesor";
import PasarAsistenciaProfesor from "../../components/profesor/PasarAsistenciaProfesor";
import ListaAlumnosProfesor from "../../components/profesor/ListaAlumnosProfesor";
import AvisosProfesor from "../../components/profesor/AvisosProfesor";
import PerfilProfesor from "../../components/profesor/PerfilProfesor";

export default function DashboardProfesor() {
  const [view, setView] = useState<
    "resumen" | "asistencia" | "alumnos" | "avisos" | "perfil"
  >("resumen");

  // Datos de ejemplo
  const alumnos = [
    {
      nombre: "Juan Pérez",
      rut: "12.345.678-9",
      email: "juan.perez@email.com",
      telefono: "+56912345678",
      direccion: "Av. Siempre Viva 742",
      fechaNacimiento: "2000-01-01",
      plan: "Mensual",
      asistencia: 18,
      fechaInicioPlan: "2025-09-01",
    },
    {
      nombre: "Ana Torres",
      rut: "98.765.432-1",
      email: "ana.torres@email.com",
      telefono: "+56987654321",
      direccion: "Calle Falsa 123",
      fechaNacimiento: "1995-05-10",
      plan: "Trimestral",
      asistencia: 22,
      fechaInicioPlan: "2025-08-15",
    },
  ];

  const avisos = [
    {
      id: "1",
      titulo: "Recordatorio de pago",
      mensaje: "Recuerda pagar tu mensualidad antes del 5 de cada mes.",
      fecha: "2025-09-20",
      leido: false,
    },
    {
      id: "2",
      titulo: "Cambio de horario",
      mensaje: "Las clases del viernes serán a las 19:00 hrs.",
      fecha: "2025-09-22",
      leido: true,
    },
  ];

  return (
    <div className={styles.layout}>
      {/* Menú lateral */}
      <aside className={styles.menu}>
        <h2 className={styles.menuTitle}>Menú</h2>
        <button
          onClick={() => setView("resumen")}
          className={`${styles.menuBtn} ${
            view === "resumen" ? styles.active : ""
          }`}
        >
          Resumen semanal
        </button>
        <button
          onClick={() => setView("asistencia")}
          className={`${styles.menuBtn} ${
            view === "asistencia" ? styles.active : ""
          }`}
        >
          Pasar asistencia
        </button>
        <button
          onClick={() => setView("alumnos")}
          className={`${styles.menuBtn} ${
            view === "alumnos" ? styles.active : ""
          }`}
        >
          Lista de alumnos
        </button>
        <button
          onClick={() => setView("avisos")}
          className={`${styles.menuBtn} ${
            view === "avisos" ? styles.active : ""
          }`}
        >
          Avisos
        </button>
        <button
          onClick={() => setView("perfil")}
          className={`${styles.menuBtn} ${
            view === "perfil" ? styles.active : ""
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login-profesor';
          }}
          className={`${styles.menuBtn} ${styles.menuBtnLogout}`}
        >
          Cerrar sesión
        </button>
      </aside>
      {/* Contenido principal */}
      <main className={styles.content}>
        <div className={styles.contentBox}>
          {view === "resumen" && <ResumenProfesor />}
          {view === "asistencia" && <PasarAsistenciaProfesor />}
          {view === "alumnos" && <ListaAlumnosProfesor alumnos={alumnos} />}
          {view === "avisos" && <AvisosProfesor avisos={avisos} />}
          {view === "perfil" && (
            <PerfilProfesor
              perfil={{
                nombre: "Pedro González",
                rut: "11.222.333-4",
                email: "pedro.gonzalez@email.com",
                telefono: "+56987654321",
                direccion: "Calle Falsa 123",
                fechaNacimiento: "1980-05-10",
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
