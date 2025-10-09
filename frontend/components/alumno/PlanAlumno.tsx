import styles from './PlanAlumno.module.css';
import { usePlan } from '../../hooks/usePlan';

export default function PlanAlumno() {
  const { plan, loading, error } = usePlan();

  if (loading) return <div className={styles.container}>Cargando plan...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;
  if (!plan) return <div className={styles.container}>No tienes un plan activo.</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Mi plan</h2>
      <div className={styles.planBox}>
        <div className={styles.planHeader}>
          <span className={styles.planName}>{plan.nombre}</span>
          <span className={plan.estadoPago === 'pagado' ? styles.paid : styles.pending}>
            {plan.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
          </span>
        </div>
        <div className={styles.planDescription}>{plan.descripcion}</div>
        <div className={styles.planDates}>
          <span>Inicio: {new Date(plan.fechaInicio).toLocaleDateString('es-CL')}</span>
          <span>Fin: {new Date(plan.fechaFin).toLocaleDateString('es-CL')}</span>
        </div>
        <div className={styles.planAmount}>
          <span>Monto: ${plan.monto.toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>
  );
}
