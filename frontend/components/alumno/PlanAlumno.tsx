import styles from './PlanAlumno.module.css';
import { useEffect, useState } from 'react';
import { HttpClient } from '../../lib/httpClient';

interface PlanInfo {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estadoPago: 'pagado' | 'pendiente';
  monto: number;
}

export default function PlanAlumno() {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await HttpClient.get<{ plan: PlanInfo }>('/alumnos/me/plan');
        
        if (response.error) {
          console.error('Error fetching plan:', response.error);
          setError(response.error);
        } else {
          setPlan(response.data?.plan || null);
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

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
