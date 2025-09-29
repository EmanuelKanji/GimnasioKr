import Link from "next/link";
import styles from './home.module.css';

// Iconos SVG
const AdminIcon = () => (
  <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TeacherIcon = () => (
  <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StudentIcon = () => (
  <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Partículas decorativas */}
      <div className={styles.particles}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>
      
      <div className={styles.container}>
        <h1 className={styles.title}>GymMaster Pro</h1>
        <p className={styles.subtitle}>Sistema de gestión integral para gimnasios</p>
        
        <div className={styles.buttonGroup}>
          <Link href="/login-admin" className={`${styles.btn} ${styles.btnPrimary}`}>
            <AdminIcon />
            Acceso Administrador
          </Link>
          
          <Link href="/login-profesor" className={`${styles.btn} ${styles.btnSecondary}`}>
            <TeacherIcon />
            Acceso Profesor
          </Link>
          
          <Link href="/login-alumno" className={`${styles.btn} ${styles.btnAccent}`}>
            <StudentIcon />
            Acceso Alumno
          </Link>
        </div>
      </div>
    </main>
  );
}