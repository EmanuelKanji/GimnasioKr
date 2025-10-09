"use client";
import { useState, useEffect } from "react";
import styles from "./dashboard-alumno.module.css";
import AsistenciaAlumno from "../../components/alumno/AsistenciaAlumno";
import PlanAlumno from "../../components/alumno/PlanAlumno";
import PerfilAlumno from "../../components/alumno/PerfilAlumno";
import AvisosAlumno from "../../components/alumno/AvisosAlumno";
import InicioAlumno from "../../components/alumno/InicioAlumno";
import QrAlumno from "../../components/alumno/QrAlumno";
import { useAsistencias } from "../../hooks/useAsistencias";
import type { PerfilInfo } from '../../../shared/types';

// Iconos SVG como componentes
const HomeIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BookIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QrIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="6" height="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="15" y="3" width="6" height="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="15" width="6" height="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 15h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 18v3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 21h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardAlumno() {
  const [view, setView] = useState<
    "inicio" | "asistencia" | "plan" | "perfil" | "avisos" | "qr"
  >("inicio");
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfil, setPerfil] = useState<PerfilInfo | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [limiteClases, setLimiteClases] = useState<'12' | '8' | 'todos_los_dias'>('todos_los_dias');
  
  // Usar el hook centralizado para asistencias
  const { asistencias: asistenciasMes } = useAsistencias();

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar perfil del alumno
      const perfilRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/alumnos/me/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const perfilData = await perfilRes.json();
      setPerfil(perfilData.perfil || null);
      
      // Obtener límite de clases del plan (por ahora hardcodeado, después se obtendrá del plan)
      if (perfilData.perfil?.plan) {
        // Aquí se debería obtener el límite de clases del plan desde la API
        // Por ahora usamos un valor por defecto basado en el nombre del plan
        const planNombre = perfilData.perfil.plan.toLowerCase();
        if (planNombre.includes('12')) {
          setLimiteClases('12');
        } else if (planNombre.includes('8')) {
          setLimiteClases('8');
        } else {
          setLimiteClases('todos_los_dias');
        }
      }
      
      setLoadingPerfil(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoadingPerfil(false);
    }
  };

  // Obtener perfil del alumno al cargar el dashboard
  useEffect(() => {
    cargarDatos();
  }, []);

  const handleViewChange = (newView: "inicio" | "asistencia" | "plan" | "perfil" | "avisos" | "qr") => {
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
    if (!perfil?.nombre) return 'A';
    return perfil.nombre.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (!perfil?.nombre) return 'Alumno';
    return perfil.nombre.split(' ')[0];
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
          <h1 className={styles.mobileTitle}></h1>
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
        style={{ zIndex: menuOpen ? 999 : -1, pointerEvents: menuOpen ? 'auto' : 'none' }}
      />

      {/* Menú Lateral Premium */}
      <aside className={`${styles.menu} ${menuOpen ? styles.active : ''}`} style={{ zIndex: menuOpen ? 1000 : 500 }}>
        <div className={styles.menuHeader}>
          <h3 className={styles.menuTitle}>Alumno</h3>
          <p className={styles.menuSubtitle}>Panel de control del alumno</p>
        </div>

        <nav className={styles.menuNav}>
          <button
            onClick={() => handleViewChange("inicio")}
            className={`${styles.menuBtn} ${view === "inicio" ? styles.active : ""}`}
          >
            <HomeIcon />
            Inicio
          </button>
          <button
            onClick={() => handleViewChange("asistencia")}
            className={`${styles.menuBtn} ${view === "asistencia" ? styles.active : ""}`}
          >
            <CalendarIcon />
            Mi asistencia
          </button>
          <button
            onClick={() => handleViewChange("plan")}
            className={`${styles.menuBtn} ${view === "plan" ? styles.active : ""}`}
          >
            <BookIcon />
            Mi plan
          </button>
          <button
            onClick={() => handleViewChange("perfil")}
            className={`${styles.menuBtn} ${view === "perfil" ? styles.active : ""}`}
          >
            <UserIcon />
            Perfil
          </button>
          <button
            onClick={() => handleViewChange("avisos")}
            className={`${styles.menuBtn} ${view === "avisos" ? styles.active : ""}`}
          >
            <BellIcon />
            Avisos
          </button>
          <button
            onClick={() => handleViewChange("qr")}
            className={`${styles.menuBtn} ${view === "qr" ? styles.active : ""}`}
          >
            <QrIcon />
            Mi QR
          </button>
        </nav>

        <div className={styles.menuFooter}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login-alumno';
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
          {view === "inicio" && <InicioAlumno />}
          {view === "asistencia" && <AsistenciaAlumno />}
          {view === "plan" && <PlanAlumno />}
          {view === "perfil" && <PerfilAlumno />}
          {view === "avisos" && <AvisosAlumno />}
          {view === "qr" && (
            loadingPerfil ? (
              <div className={styles.loadingState}>Cargando QR...</div>
            ) : perfil ? (
              <QrAlumno
                rut={perfil?.rut ?? ''}
                plan={perfil?.plan ?? ''}
                fechaInicio={perfil?.fechaInicioPlan ?? ''}
                fechaFin={perfil?.fechaTerminoPlan ?? ''}
                limiteClases={limiteClases}
                asistenciasMes={asistenciasMes}
              />
            ) : (
              <div className={styles.errorState}>No se encontró el perfil del alumno.</div>
            )
          )}
        </div>
      </main>
    </div>
  );
}