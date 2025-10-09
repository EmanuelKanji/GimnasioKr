import { useState, useEffect, useCallback } from 'react';
import { CACHE_CONFIG } from '../lib/cacheConfig';
import { notifyRenovacionActualizada } from '../lib/events';

type EstadoRenovacion = 'ninguno' | 'solicitada' | 'procesando' | 'completada';

interface EstadoRenovacionCache {
  data: EstadoRenovacion;
  lastFetch: number;
  isLoading: boolean;
}

// Cache global para estado de renovación
let estadoRenovacionCache: EstadoRenovacionCache = {
  data: 'ninguno',
  lastFetch: 0,
  isLoading: false
};

// Listeners para notificar cambios
const listeners = new Set<() => void>();

const { ttl, minInterval } = CACHE_CONFIG.estadoRenovacion;

export function useEstadoRenovacion() {
  const [estado, setEstado] = useState<EstadoRenovacion>(estadoRenovacionCache.data);
  const [loading, setLoading] = useState(estadoRenovacionCache.isLoading);

  const fetchEstadoRenovacion = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Si no es forzado y tenemos datos recientes, no hacer petición
    if (!force && (now - estadoRenovacionCache.lastFetch) < ttl) {
      return;
    }

    // Si ya hay una petición en curso, no hacer otra
    if (estadoRenovacionCache.isLoading) {
      return;
    }

    // Verificar intervalo mínimo entre peticiones
    if (!force && (now - estadoRenovacionCache.lastFetch) < minInterval) {
      return;
    }

    try {
      estadoRenovacionCache.isLoading = true;
      setLoading(true);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/me/estado-renovacion`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        estadoRenovacionCache.data = data.estado || 'ninguno';
        estadoRenovacionCache.lastFetch = now;
        setEstado(estadoRenovacionCache.data);
      } else if (res.status === 429) {
        console.warn('Rate limit alcanzado para estado renovación, reintentando en 60 segundos...');
        // En caso de rate limit, esperar más tiempo
        estadoRenovacionCache.lastFetch = now - ttl + 60000;
      } else {
        console.error('Error cargando estado renovación:', res.status);
      }
    } catch (error) {
      console.error('Error de conexión cargando estado renovación:', error);
    } finally {
      estadoRenovacionCache.isLoading = false;
      setLoading(false);
    }
  }, []);

  const refreshEstadoRenovacion = useCallback(() => {
    fetchEstadoRenovacion(true);
  }, [fetchEstadoRenovacion]);

  // Notificar a todos los listeners cuando cambie el estado
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  useEffect(() => {
    const listener = () => {
      setEstado(estadoRenovacionCache.data);
      setLoading(estadoRenovacionCache.isLoading);
    };

    listeners.add(listener);

    // Cargar datos iniciales
    fetchEstadoRenovacion();

    return () => {
      listeners.delete(listener);
    };
  }, [fetchEstadoRenovacion]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleRenovacionUpdate = () => {
      fetchEstadoRenovacion(true);
    };

    window.addEventListener('renovacionActualizada', handleRenovacionUpdate);
    
    return () => {
      window.removeEventListener('renovacionActualizada', handleRenovacionUpdate);
    };
  }, [fetchEstadoRenovacion]);

  // Función para actualizar estado localmente y notificar
  const updateEstado = useCallback((newEstado: EstadoRenovacion) => {
    estadoRenovacionCache.data = newEstado;
    setEstado(newEstado);
    notifyListeners();
    notifyRenovacionActualizada(newEstado);
  }, [notifyListeners]);

  return {
    estado,
    loading,
    refreshEstadoRenovacion,
    updateEstado
  };
}
