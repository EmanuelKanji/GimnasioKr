import styles from './AvisosProfesor.module.css';

interface Aviso {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export default function AvisosProfesor({ avisos = [] }: { avisos: Aviso[] }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Avisos y mensajes</h2>
      <div className={styles.inbox}>
        {avisos.length === 0 && (
          <div className={styles.emptyState}>No tienes avisos nuevos.</div>
        )}
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`${styles.aviso} ${aviso.leido ? styles.leido : styles.noleido}`}>
            <div className={styles.avisoHeader}>
              <span className={styles.avisoTitle}>{aviso.titulo}</span>
              <span className={styles.avisoDate}>{new Date(aviso.fecha).toLocaleDateString('es-CL')}</span>
            </div>
            <div className={styles.avisoMensaje}>{aviso.mensaje}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
