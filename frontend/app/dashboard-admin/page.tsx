'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InscribirAlumnoForm from '../../components/admin/InscribirAlumno';
import GestionarPlanes from '../../components/admin/GestionarPlanes';
import PasarAsistencia from '../../components/admin/PasarAsistencia';
import ListaAlumnos from '../../components/admin/ListaAlumnos';
import CrearUsuarioForm from '../../components/admin/CrearUsuarioForm';
import HistorialAsistencia from '../../components/admin/HistorialAsistencia';
import styles from './dashboard-admin.module.css';

// Iconos SVG para el dashboard admin
const UserPlusIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="19" y1="8" x2="19" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="22" y1="11" x2="16" y2="11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const UserCogIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8.5" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m18 8 2 2-2 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m20 12-2 2 2 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HistoryIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg className={styles.menuBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardAdmin() {
  const [view, setView] = useState<'inscribir' | 'planes' | 'asistencia' | 'lista' | 'crearUsuario' | 'historial'>('inscribir');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login-admin');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        router.replace('/login-admin');
      }
    } catch {
      router.replace('/login-admin');
    }
  }, [router]);

  const handleViewChange = (newView: 'inscribir' | 'planes' | 'asistencia' | 'lista' | 'crearUsuario' | 'historial') => {
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
            <div className={styles.userAvatar}>A</div>
            <span className={styles.userName}>Administrador</span>
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
          <h2 className={styles.menuTitle}>Admin Portal</h2>
          <p className={styles.menuSubtitle}>Panel de control administrativo</p>
        </div>

        <nav className={styles.menuNav}>
          <button 
            onClick={() => handleViewChange('inscribir')} 
            className={`${styles.menuBtn} ${view === 'inscribir' ? styles.active : ''}`}
          >
            <UserPlusIcon />
            Inscribir Alumno
          </button>
          <button 
            onClick={() => handleViewChange('planes')} 
            className={`${styles.menuBtn} ${view === 'planes' ? styles.active : ''}`}
          >
            <BookOpenIcon />
            Gestionar Planes
          </button>
          <button 
            onClick={() => handleViewChange('asistencia')} 
            className={`${styles.menuBtn} ${view === 'asistencia' ? styles.active : ''}`}
          >
            <ClipboardCheckIcon />
            Pasar Asistencia
          </button>
          <button 
            onClick={() => handleViewChange('historial')} 
            className={`${styles.menuBtn} ${view === 'historial' ? styles.active : ''}`}
          >
            <HistoryIcon />
            Historial de Asistencia
          </button>
          <button 
            onClick={() => handleViewChange('lista')} 
            className={`${styles.menuBtn} ${view === 'lista' ? styles.active : ''}`}
          >
            <UsersIcon />
            Lista de Alumnos
          </button>
          <button 
            onClick={() => handleViewChange('crearUsuario')} 
            className={`${styles.menuBtn} ${view === 'crearUsuario' ? styles.active : ''}`}
          >
            <UserCogIcon />
            Crear Usuario
          </button>
        </nav>

        <div className={styles.menuFooter}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.replace('/login-admin');
            }}
            className={`${styles.menuBtn} ${styles.menuBtnLogout}`}
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal Premium */}
      <main className={styles.content} style={{ zIndex: menuOpen ? 1 : 1001 }}>
        <div className={styles.contentBox}>
          {view === 'inscribir' && <InscribirAlumnoForm />}
          {view === 'planes' && <GestionarPlanes />}
          {view === 'asistencia' && <PasarAsistencia />}
          {view === 'historial' && <HistorialAsistencia />}
          {view === 'lista' && <ListaAlumnos />}
          {view === 'crearUsuario' && <CrearUsuarioForm />}
        </div>
      </main>
    </div>
  );
}