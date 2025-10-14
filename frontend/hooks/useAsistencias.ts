import { useState, useEffect, useCallback } from 'react';

interface AsistenciasCache {
  data: string[];
  lastFetch: number;
  isLoading: boolean;
}

// Cache global para asistencias
let asistenciasCache: AsistenciasCache = {
  data: [],
  lastFetch: 0,
  isLoading: false
};

// Listeners para notificar cambios
const listeners = new Set<() => void>();

const CACHE_DURATION = 60000; // 1 minuto
const MIN_FETCH_INTERVAL = 30000; // 30 segundos mínimo entre peticiones

export function useAsistencias() {
  const [asistencias, setAsistencias] = useState<string[]>(asistenciasCache.data);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/me/asistencias`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        asistenciasCache.data = data.diasAsistidos || [];
        asistenciasCache.lastFetch = now;
        setAsistencias(asistenciasCache.data);
      } else if (res.status === 429) {
        console.warn('Rate limit alcanzado, reintentando en 60 segundos...');
        // En caso de rate limit, esperar más tiempo
        asistenciasCache.lastFetch = now - CACHE_DURATION + 60000;
      } else {
        console.error('Error cargando asistencias:', res.status);
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
  }, [fetchAsistencias]);

  // Notificar a todos los listeners cuando cambien las asistencias
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  useEffect(() => {
    const listener = () => {
      setAsistencias(asistenciasCache.data);
      setLoading(asistenciasCache.isLoading);
    };

    const handleAsistenciaRegistrada = (event: CustomEvent) => {
      console.log('🔄 Asistencia registrada, actualizando cache...', event.detail);
      // Agregar la fecha de hoy al cache
      const hoy = new Date().toISOString().split('T')[0];
      addAsistencia(hoy);
    };

    listeners.add(listener);
    window.addEventListener('asistenciaRegistrada', handleAsistenciaRegistrada as EventListener);

    // Cargar datos iniciales
    fetchAsistencias();

    return () => {
      listeners.delete(listener);
      window.removeEventListener('asistenciaRegistrada', handleAsistenciaRegistrada as EventListener);
    };
  }, [fetchAsistencias, addAsistencia]);

  // Función para registrar una nueva asistencia localmente
  const addAsistencia = useCallback((fecha: string) => {
    if (!asistenciasCache.data.includes(fecha)) {
      asistenciasCache.data = [...asistenciasCache.data, fecha];
      setAsistencias(asistenciasCache.data);
      notifyListeners();
    }
  }, [notifyListeners]);

  return {
    asistencias,
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
