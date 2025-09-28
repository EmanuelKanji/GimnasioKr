import styles from './PerfilProfesor.module.css';

interface PerfilInfo {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
}

export default function PerfilProfesor({ perfil }: { perfil: PerfilInfo }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi perfil</h2>
      <div className={styles.perfilBox}>
        <div className={styles.infoRow}><span className={styles.label}>Nombre:</span> <span>{perfil.nombre}</span></div>
        <div className={styles.infoRow}><span className={styles.label}>RUT:</span> <span>{perfil.rut}</span></div>
        <div className={styles.infoRow}><span className={styles.label}>Correo:</span> <span>{perfil.email}</span></div>
        <div className={styles.infoRow}><span className={styles.label}>Teléfono:</span> <span>{perfil.telefono}</span></div>
        <div className={styles.infoRow}><span className={styles.label}>Dirección:</span> <span>{perfil.direccion}</span></div>
        <div className={styles.infoRow}><span className={styles.label}>Fecha de nacimiento:</span> <span>{new Date(perfil.fechaNacimiento).toLocaleDateString('es-CL')}</span></div>
      </div>
      <button className={styles.editBtn} type="button">Editar información</button>
    </div>
  );
}

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
