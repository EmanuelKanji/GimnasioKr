"use client";
import { useState, useEffect } from "react";
import styles from "./dashboard-profesor.module.css";
import ResumenProfesor from "../../components/profesor/ResumenProfesor";
import PasarAsistenciaProfesor from "../../components/profesor/PasarAsistenciaProfesor";
import ListaAlumnosProfesor from "../../components/profesor/ListaAlumnosProfesor";
import type { Alumno } from '../../../shared/types';
import AvisosProfesor from "../../components/profesor/AvisosProfesor";
import PerfilProfesor from "../../components/profesor/PerfilProfesor";

export default function DashboardProfesor() {
  const [view, setView] = useState<
    "resumen" | "asistencia" | "alumnos" | "avisos" | "perfil"
  >("resumen");

  // Lista de todos los alumnos inscritos (fetch desde backend)
  const [alumnosInscritos, setAlumnosInscritos] = useState<Alumno[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:4000/api/alumnos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject('Error al obtener alumnos'))
      .then(data => {
        if (Array.isArray(data)) {
          setAlumnosInscritos(data);
        } else if (Array.isArray(data.alumnos)) {
          setAlumnosInscritos(data.alumnos);
        } else {
          setAlumnosInscritos([]);
        }
        setLoadingAlumnos(false);
      })
      .catch(() => {
        setAlumnosInscritos([]);
        setLoadingAlumnos(false);
      });
  }, []);

  // Estado para la lista de "mis alumnos" del profesor
  const [misAlumnos, setMisAlumnos] = useState<Alumno[]>([]);

  // Funciones para agregar/eliminar alumnos
  const agregarAlumno = (alumno: Alumno) => {
    if (!misAlumnos.some(a => a.rut === alumno.rut)) {
      setMisAlumnos(prev => [...prev, alumno]);
    }
  };
  const eliminarAlumno = (rut: string) => {
    setMisAlumnos(prev => prev.filter(a => a.rut !== rut));
  };

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
          {view === "alumnos" && (
            <ListaAlumnosProfesor
              alumnos={alumnosInscritos}
              misAlumnos={misAlumnos}
              agregarAlumno={agregarAlumno}
              eliminarAlumno={eliminarAlumno}
              loading={loadingAlumnos}
            />
          )}
          {view === "avisos" && (
            <AvisosProfesor misAlumnos={misAlumnos} />
          )}
          {view === "perfil" && (
            <PerfilProfesor />
          )}
        </div>
      </main>
    </div>
  );
}
