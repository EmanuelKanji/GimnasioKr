import { useState, useEffect, useCallback } from 'react';
import { CACHE_CONFIG } from '../lib/cacheConfig';
import { notifyAvisosActualizados } from '../lib/events';

interface Aviso {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  destinatarios?: string[];
}

interface AvisosCache {
  data: Aviso[];
  lastFetch: number;
  isLoading: boolean;
  tipo: 'alumno' | 'profesor';
}

// Cache global para avisos (separado por tipo)
let avisosCache: { [key: string]: AvisosCache } = {};

// Listeners para notificar cambios
const listeners = new Set<() => void>();

const { ttl, minInterval } = CACHE_CONFIG.avisos;

export function useAvisos(tipo: 'alumno' | 'profesor' = 'alumno') {
  const cacheKey = tipo;
  
  // Inicializar cache si no existe
  if (!avisosCache[cacheKey]) {
    avisosCache[cacheKey] = {
      data: [],
      lastFetch: 0,
      isLoading: false,
      tipo
    };
  }

  const [avisos, setAvisos] = useState<Aviso[]>(avisosCache[cacheKey].data);
  const [loading, setLoading] = useState(avisosCache[cacheKey].isLoading);

  const fetchAvisos = useCallback(async (force = false) => {
    const now = Date.now();
    const cache = avisosCache[cacheKey];
    
    // Si no es forzado y tenemos datos recientes, no hacer petición
    if (!force && cache.data.length > 0 && (now - cache.lastFetch) < ttl) {
      return;
    }

    // Si ya hay una petición en curso, no hacer otra
    if (cache.isLoading) {
      return;
    }

    // Verificar intervalo mínimo entre peticiones
    if (!force && (now - cache.lastFetch) < minInterval) {
      return;
    }

    try {
      cache.isLoading = true;
      setLoading(true);

      const token = localStorage.getItem('token');
      const endpoint = tipo === 'alumno' ? '/api/avisos/alumno' : '/api/avisos/profesor';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const avisosFormateados = Array.isArray(data) ? data.map(aviso => ({
          id: aviso._id || aviso.id,
          titulo: aviso.titulo,
          mensaje: aviso.mensaje,
          fecha: aviso.fecha,
          leido: aviso.leido || false,
          destinatarios: aviso.destinatarios
        })) : [];
        
        cache.data = avisosFormateados;
        cache.lastFetch = now;
        setAvisos(cache.data);
      } else if (res.status === 429) {
        console.warn('Rate limit alcanzado para avisos, reintentando en 60 segundos...');
        // En caso de rate limit, esperar más tiempo
        cache.lastFetch = now - ttl + 60000;
      } else {
        console.error('Error cargando avisos:', res.status);
      }
    } catch (error) {
      console.error('Error de conexión cargando avisos:', error);
    } finally {
      cache.isLoading = false;
      setLoading(false);
    }
  }, [tipo, cacheKey]);

  const refreshAvisos = useCallback(() => {
    fetchAvisos(true);
  }, [fetchAvisos]);

  // Notificar a todos los listeners cuando cambien los avisos
  const notifyListeners = useCallback(() => {
    listeners.forEach(listener => listener());
  }, []);

  useEffect(() => {
    const listener = () => {
      setAvisos(avisosCache[cacheKey].data);
      setLoading(avisosCache[cacheKey].isLoading);
    };

    listeners.add(listener);

    // Cargar datos iniciales
    fetchAvisos();

    return () => {
      listeners.delete(listener);
    };
  }, [fetchAvisos, cacheKey]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleAvisosUpdate = () => {
      fetchAvisos(true);
    };

    window.addEventListener('avisosActualizados', handleAvisosUpdate);
    
    return () => {
      window.removeEventListener('avisosActualizados', handleAvisosUpdate);
    };
  }, [fetchAvisos]);

  // Función para agregar aviso localmente y notificar
  const addAviso = useCallback((nuevoAviso: Aviso) => {
    const cache = avisosCache[cacheKey];
    cache.data = [nuevoAviso, ...cache.data];
    setAvisos(cache.data);
    notifyListeners();
    notifyAvisosActualizados(nuevoAviso);
  }, [cacheKey, notifyListeners]);

  // Función para marcar aviso como leído
  const marcarComoLeido = useCallback((avisoId: string) => {
    const cache = avisosCache[cacheKey];
    cache.data = cache.data.map(aviso => 
      aviso.id === avisoId ? { ...aviso, leido: true } : aviso
    );
    setAvisos(cache.data);
    notifyListeners();
  }, [cacheKey, notifyListeners]);

  return {
    avisos,
    loading,
    refreshAvisos,
    addAviso,
    marcarComoLeido
  };
}
