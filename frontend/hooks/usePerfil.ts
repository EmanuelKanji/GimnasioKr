import { useState, useEffect, useCallback } from 'react';
import { CACHE_CONFIG } from '../lib/cacheConfig';
import { notifyPerfilActualizado } from '../lib/events';

interface PerfilInfo {
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  plan?: string;
  fechaInicioPlan?: string;
  fechaTerminoPlan?: string;
}

interface PerfilCache {
  data: PerfilInfo | null;
  lastFetch: number;
  isLoading: boolean;
}

// Cache global para perfil
let perfilCache: PerfilCache = {
  data: null,
  lastFetch: 0,
  isLoading: false
};

// Listeners para notificar cambios
const listeners = new Set<() => void>();

const { ttl, minInterval } = CACHE_CONFIG.perfil;

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilInfo | null>(perfilCache.data);
  const [loading, setLoading] = useState(perfilCache.isLoading);

  const fetchPerfil = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Si no es forzado y tenemos datos recientes, no hacer petición
    if (!force && perfilCache.data && (now - perfilCache.lastFetch) < ttl) {
      return;
    }

    // Si ya hay una petición en curso, no hacer otra
    if (perfilCache.isLoading) {
      return;
    }

    // Verificar intervalo mínimo entre peticiones
    if (!force && (now - perfilCache.lastFetch) < minInterval) {
      return;
    }

    try {
      perfilCache.isLoading = true;
      setLoading(true);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/me/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        perfilCache.data = data.perfil || null;
        perfilCache.lastFetch = now;
        setPerfil(perfilCache.data);
      } else if (res.status === 429) {
        console.warn('Rate limit alcanzado para perfil, reintentando en 60 segundos...');
        // En caso de rate limit, esperar más tiempo
        perfilCache.lastFetch = now - ttl + 60000;
      } else {
        console.error('Error cargando perfil:', res.status);
      }
    } catch (error) {
      console.error('Error de conexión cargando perfil:', error);
    } finally {
      perfilCache.isLoading = false;
      setLoading(false);
    }
  }, []);

  const refreshPerfil = useCallback(() => {
    fetchPerfil(true);
  }, [fetchPerfil]);

  // Notificar a todos los listeners cuando cambie el perfil
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  useEffect(() => {
    const listener = () => {
      setPerfil(perfilCache.data);
      setLoading(perfilCache.isLoading);
    };

    listeners.add(listener);

    // Cargar datos iniciales
    fetchPerfil();

    return () => {
      listeners.delete(listener);
    };
  }, [fetchPerfil]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const handlePerfilUpdate = () => {
      fetchPerfil(true);
    };

    window.addEventListener('perfilActualizado', handlePerfilUpdate);
    
    return () => {
      window.removeEventListener('perfilActualizado', handlePerfilUpdate);
    };
  }, [fetchPerfil]);

  // Función para actualizar perfil localmente y notificar
  const updatePerfil = useCallback((newPerfil: PerfilInfo) => {
    perfilCache.data = newPerfil;
    setPerfil(newPerfil);
    notifyListeners();
    notifyPerfilActualizado(newPerfil);
  }, [notifyListeners]);

  return {
    perfil,
    loading,
    refreshPerfil,
    updatePerfil
  };
}
