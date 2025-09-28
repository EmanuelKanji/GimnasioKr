import styles from './ListaAlumnosProfesor.module.css';

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

export default function ListaAlumnosProfesor({ alumnos = [] }: { alumnos: Alumno[] }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Alumnos Inscritos</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Nombre</th>
              <th className={styles.tableHeader}>RUT</th>
              <th className={styles.tableHeader}>Plan</th>
              <th className={styles.tableHeader}>Inicio</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell} data-label="Nombre">
                  {alumno.nombre}
                </td>
                <td className={styles.tableCell} data-label="RUT">
                  {alumno.rut}
                </td>
                <td className={styles.tableCell} data-label="Plan">
                  <span className={styles.planBadge}>{alumno.plan}</span>
                </td>
                <td className={styles.tableCell} data-label="Inicio">
                  <span className={styles.date}>{formatDate(alumno.fechaInicioPlan)}</span>
                </td>
              </tr>
            ))}
            {alumnos.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.emptyStateCell}>
                  No hay alumnos inscritos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
