"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import styles from "./dashboard-profesor.module.css";
import ResumenProfesor from "../../components/profesor/ResumenProfesor";
import PasarAsistenciaProfesor from "../../components/profesor/PasarAsistenciaProfesor";
import ListaAlumnosProfesor from "../../components/profesor/ListaAlumnosProfesor";
import type { Alumno } from '../../../shared/types';
import AvisosProfesor from "../../components/profesor/AvisosProfesor";
import PerfilProfesor from "../../components/profesor/PerfilProfesor";

// Iconos SVG para el dashboard profesor
const HomeIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="9" y="3" width="6" height="4" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m9 12 2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardProfesor() {
  const [view, setView] = useState<
    "resumen" | "asistencia" | "alumnos" | "avisos" | "perfil"
  >("resumen");
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfilProfesor, setPerfilProfesor] = useState<{nombre: string} | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const router = useRouter();

  // Lista de todos los alumnos inscritos (fetch desde backend)
  const [alumnosInscritos, setAlumnosInscritos] = useState<Alumno[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  // Verificar autenticación y obtener perfil del profesor
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login-profesor');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'profesor') {
        router.replace('/login-profesor');
        return;
      }
    } catch {
      router.replace('/login-profesor');
      return;
    }

    // Obtener perfil del profesor (fallback si no hay endpoint específico)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setPerfilProfesor({ nombre: payload.username || 'Profesor' });
      setLoadingPerfil(false);
    } catch {
      setPerfilProfesor({ nombre: 'Profesor' });
      setLoadingPerfil(false);
    }
  }, [router]);

  // Obtener lista de alumnos
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/alumnos', {
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

  // Estado para la lista de "mis alumnos" del profesor (con persistencia)
  const [misAlumnos, setMisAlumnos] = useState<Alumno[]>([]);
  const [loadingMisAlumnos, setLoadingMisAlumnos] = useState(true);

  // Obtener "mis alumnos" del backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/mis-alumnos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject('Error al obtener mis alumnos'))
      .then(data => {
        setMisAlumnos(Array.isArray(data) ? data : []);
        setLoadingMisAlumnos(false);
      })
      .catch(() => {
        setMisAlumnos([]);
        setLoadingMisAlumnos(false);
      });
  }, []);

  // Funciones para agregar/eliminar alumnos (con persistencia)
  const agregarAlumno = async (alumno: Alumno) => {
    if (misAlumnos.some(a => a.rut === alumno.rut)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/mis-alumnos/agregar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rutAlumno: alumno.rut }),
      });

      if (res.ok) {
        setMisAlumnos(prev => [...prev, alumno]);
      } else {
        console.error('Error al agregar alumno al backend');
      }
    } catch (error) {
      console.error('Error de conexión al agregar alumno:', error);
    }
  };

  const eliminarAlumno = async (rut: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/profesor/mis-alumnos/eliminar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rutAlumno: rut }),
      });

      if (res.ok) {
        setMisAlumnos(prev => prev.filter(a => a.rut !== rut));
      } else {
        console.error('Error al eliminar alumno del backend');
      }
    } catch (error) {
      console.error('Error de conexión al eliminar alumno:', error);
    }
  };

  // Funciones de navegación móvil
  const handleViewChange = (newView: "resumen" | "asistencia" | "alumnos" | "avisos" | "perfil") => {
    setView(newView);
    if (window.innerWidth <= 768) {
      setMenuOpen(false);
    }
  };

  const handleOverlayClick = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getUserInitial = () => {
    if (!perfilProfesor?.nombre) return 'P';
    return perfilProfesor.nombre.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (!perfilProfesor?.nombre) return 'Profesor';
    return perfilProfesor.nombre.split(' ')[0];
  };

  return (
    <div className={styles.layout}>
      {/* Botón Hamburguesa Premium */}
      <button 
        className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Header Móvil Premium */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <h1 className={styles.mobileTitle}>Profesor Portal</h1>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>
              {getUserInitial()}
            </div>
            <span className={styles.userName}>{getUserName()}</span>
          </div>
        </div>
      </header>

      {/* Overlay Premium */}
      <div 
        className={`${styles.mobileOverlay} ${menuOpen ? styles.active : ''}`}
        onClick={handleOverlayClick}
      />

      {/* Menú Lateral Premium */}
      <aside className={`${styles.menu} ${menuOpen ? styles.active : ''}`}>
        <div className={styles.menuHeader}>
          <h2 className={styles.menuTitle}>Profesor Portal</h2>
          <p className={styles.menuSubtitle}>Panel de control del profesor</p>
        </div>

        <nav className={styles.menuNav}>
          <button
            onClick={() => handleViewChange("resumen")}
            className={`${styles.menuBtn} ${view === "resumen" ? styles.active : ""}`}
          >
            <HomeIcon />
            Resumen semanal
          </button>
          <button
            onClick={() => handleViewChange("asistencia")}
            className={`${styles.menuBtn} ${view === "asistencia" ? styles.active : ""}`}
          >
            <ClipboardCheckIcon />
            Pasar asistencia
          </button>
          <button
            onClick={() => handleViewChange("alumnos")}
            className={`${styles.menuBtn} ${view === "alumnos" ? styles.active : ""}`}
          >
            <UsersIcon />
            Lista de alumnos
          </button>
          <button
            onClick={() => handleViewChange("avisos")}
            className={`${styles.menuBtn} ${view === "avisos" ? styles.active : ""}`}
          >
            <BellIcon />
            Avisos
          </button>
          <button
            onClick={() => handleViewChange("perfil")}
            className={`${styles.menuBtn} ${view === "perfil" ? styles.active : ""}`}
          >
            <UserIcon />
            Perfil
          </button>
        </nav>

        <div className={styles.menuFooter}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.replace('/login-profesor');
            }}
            className={`${styles.menuBtn} ${styles.menuBtnLogout}`}
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal Premium */}
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
              loading={loadingAlumnos || loadingMisAlumnos}
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
