import { useState, useEffect, useCallback } from 'react';
import { CACHE_CONFIG } from '../lib/cacheConfig';
import { notifyPlanActualizado } from '../lib/events';

interface PlanInfo {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estadoPago: 'pagado' | 'pendiente';
  monto: number;
}

interface PlanCache {
  data: PlanInfo | null;
  lastFetch: number;
  isLoading: boolean;
  error: string | null;
}

// Cache global para plan
let planCache: PlanCache = {
  data: null,
  lastFetch: 0,
  isLoading: false,
  error: null
};

// Listeners para notificar cambios
const listeners = new Set<() => void>();

const { ttl, minInterval } = CACHE_CONFIG.plan;

export function usePlan() {
  const [plan, setPlan] = useState<PlanInfo | null>(planCache.data);
  const [loading, setLoading] = useState(planCache.isLoading);
  const [error, setError] = useState<string | null>(planCache.error);

  const fetchPlan = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Si no es forzado y tenemos datos recientes, no hacer petición
    if (!force && planCache.data && (now - planCache.lastFetch) < ttl) {
      return;
    }

    // Si ya hay una petición en curso, no hacer otra
    if (planCache.isLoading) {
      return;
    }

    // Verificar intervalo mínimo entre peticiones
    if (!force && (now - planCache.lastFetch) < minInterval) {
      return;
    }

    try {
      planCache.isLoading = true;
      planCache.error = null;
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/me/plan`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        planCache.data = data.plan || null;
        planCache.lastFetch = now;
        setPlan(planCache.data);
      } else if (res.status === 429) {
        console.warn('Rate limit alcanzado para plan, reintentando en 60 segundos...');
        // En caso de rate limit, esperar más tiempo
        planCache.lastFetch = now - ttl + 60000;
      } else {
        const errorMsg = `Error cargando plan: ${res.status}`;
        planCache.error = errorMsg;
        setError(errorMsg);
        console.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Error de conexión cargando plan';
      planCache.error = errorMsg;
      setError(errorMsg);
      console.error(errorMsg, error);
    } finally {
      planCache.isLoading = false;
      setLoading(false);
    }
  }, []);

  const refreshPlan = useCallback(() => {
    fetchPlan(true);
  }, [fetchPlan]);

  // Notificar a todos los listeners cuando cambie el plan
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  useEffect(() => {
    const listener = () => {
      setPlan(planCache.data);
      setLoading(planCache.isLoading);
      setError(planCache.error);
    };

    listeners.add(listener);

    // Cargar datos iniciales
    fetchPlan();

    return () => {
      listeners.delete(listener);
    };
  }, [fetchPlan]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const handlePlanUpdate = () => {
      fetchPlan(true);
    };

    window.addEventListener('planActualizado', handlePlanUpdate);
    
    return () => {
      window.removeEventListener('planActualizado', handlePlanUpdate);
    };
  }, [fetchPlan]);

  // Función para actualizar plan localmente y notificar
  const updatePlan = useCallback((newPlan: PlanInfo) => {
    planCache.data = newPlan;
    setPlan(newPlan);
    notifyListeners();
    notifyPlanActualizado(newPlan);
  }, [notifyListeners]);

  return {
    plan,
    loading,
    error,
    refreshPlan,
    updatePlan
  };
}
