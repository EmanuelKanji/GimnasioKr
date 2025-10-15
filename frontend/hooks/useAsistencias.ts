import { useState, useEffect, useCallback } from 'react';

interface AsistenciasCache {
  data: string[];
  totalAsistencias: number;
  limiteClases: number;
  asistenciasRestantes: number;
  periodoActual: {
    inicio: string;
    fin: string;
    numeroMes: number;
  };
  lastFetch: number;
  isLoading: boolean;
}

// Cache global para asistencias
let asistenciasCache: AsistenciasCache = {
  data: [],
  totalAsistencias: 0,
  limiteClases: 0,
  asistenciasRestantes: 0,
  periodoActual: {
    inicio: '',
    fin: '',
    numeroMes: 1
  },
  lastFetch: 0,
  isLoading: false
};

// Listeners para notificar cambios
const listeners = new Set<() => void>();

const CACHE_DURATION = 60000; // 1 minuto
const MIN_FETCH_INTERVAL = 30000; // 30 segundos mínimo entre peticiones

export function useAsistencias() {
  const [asistencias, setAsistencias] = useState<string[]>(asistenciasCache.data);
  const [totalAsistencias, setTotalAsistencias] = useState(asistenciasCache.totalAsistencias);
  const [limiteClases, setLimiteClases] = useState(asistenciasCache.limiteClases);
  const [asistenciasRestantes, setAsistenciasRestantes] = useState(asistenciasCache.asistenciasRestantes);
  const [periodoActual, setPeriodoActual] = useState(asistenciasCache.periodoActual);
  const [loading, setLoading] = useState(asistenciasCache.isLoading);

  const fetchAsistencias = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Si no es forzado y tenemos datos recientes, no hacer petición
    if (!force && asistenciasCache.data.length > 0 && (now - asistenciasCache.lastFetch) < CACHE_DURATION) {
      return;
    }

    // Si ya hay una petición en curso, no hacer otra
    if (asistenciasCache.isLoading) {
      return;
    }

    // Verificar intervalo mínimo entre peticiones
    if (!force && (now - asistenciasCache.lastFetch) < MIN_FETCH_INTERVAL) {
      return;
    }

    try {
      asistenciasCache.isLoading = true;
      setLoading(true);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/me/asistencias-mes-actual`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        
        asistenciasCache.data = data.asistenciasMesActual || [];
        asistenciasCache.totalAsistencias = data.totalAsistencias || 0;
        asistenciasCache.limiteClases = data.limiteClases || 0;
        asistenciasCache.asistenciasRestantes = data.asistenciasRestantes || 0;
        asistenciasCache.periodoActual = data.periodoActual || {
          inicio: '',
          fin: '',
          numeroMes: 1
        };
        asistenciasCache.lastFetch = now;
        
        setAsistencias(asistenciasCache.data);
        setTotalAsistencias(asistenciasCache.totalAsistencias);
        setLimiteClases(asistenciasCache.limiteClases);
        setAsistenciasRestantes(asistenciasCache.asistenciasRestantes);
        setPeriodoActual(asistenciasCache.periodoActual);
      } else if (res.status === 429) {
        console.warn('Rate limit alcanzado, reintentando en 60 segundos...');
        // En caso de rate limit, esperar más tiempo
        asistenciasCache.lastFetch = now - CACHE_DURATION + 60000;
      } else {
        console.error('Error cargando asistencias:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      asistenciasCache.isLoading = false;
      setLoading(false);
    }
  }, []);

  const refreshAsistencias = useCallback(() => {
    fetchAsistencias(true);
  }, []);

  // Notificar a todos los listeners cuando cambien las asistencias
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  useEffect(() => {
    const listener = () => {
      setAsistencias(asistenciasCache.data);
      setTotalAsistencias(asistenciasCache.totalAsistencias);
      setLimiteClases(asistenciasCache.limiteClases);
      setAsistenciasRestantes(asistenciasCache.asistenciasRestantes);
      setPeriodoActual(asistenciasCache.periodoActual);
      setLoading(asistenciasCache.isLoading);
    };

    const handleAsistenciaRegistrada = (event: CustomEvent) => {
      // Forzar recarga de datos desde el servidor
      fetchAsistencias(true);
    };

    listeners.add(listener);
    window.addEventListener('asistenciaRegistrada', handleAsistenciaRegistrada as EventListener);

    // Cargar datos iniciales solo si no hay datos en cache
    if (asistenciasCache.data.length === 0) {
      fetchAsistencias();
    }

    return () => {
      listeners.delete(listener);
      window.removeEventListener('asistenciaRegistrada', handleAsistenciaRegistrada as EventListener);
    };
  }, [fetchAsistencias]);

  // Función para registrar una nueva asistencia localmente
  const addAsistencia = useCallback((fecha: string) => {
    if (!asistenciasCache.data.includes(fecha)) {
      asistenciasCache.data = [...asistenciasCache.data, fecha];
      asistenciasCache.totalAsistencias = asistenciasCache.data.length;
      asistenciasCache.asistenciasRestantes = Math.max(0, asistenciasCache.limiteClases - asistenciasCache.totalAsistencias);
      
      setAsistencias(asistenciasCache.data);
      setTotalAsistencias(asistenciasCache.totalAsistencias);
      setAsistenciasRestantes(asistenciasCache.asistenciasRestantes);
      notifyListeners();
    }
  }, [notifyListeners]);

  return {
    asistencias,
    totalAsistencias,
    limiteClases,
    asistenciasRestantes,
    periodoActual,
    loading,
    refreshAsistencias,
    addAsistencia
  };
}

// Función para notificar que se registró una asistencia
export function notifyAsistenciaRegistrada(fecha: string) {
  // Actualizar cache local
  if (!asistenciasCache.data.includes(fecha)) {
    asistenciasCache.data = [...asistenciasCache.data, fecha];
  }
  
  // Notificar a todos los listeners
  listeners.forEach(listener => listener());
  
  // Disparar evento personalizado para compatibilidad
  window.dispatchEvent(new CustomEvent('asistenciaRegistrada', { detail: { fecha } }));
}
