export const CACHE_CONFIG = {
  perfil: {
    ttl: 10 * 60 * 1000,      // 10 minutos
    minInterval: 5 * 60 * 1000 // 5 minutos
  },
  avisos: {
    ttl: 5 * 60 * 1000,        // 5 minutos
    minInterval: 2 * 60 * 1000 // 2 minutos
  },
  plan: {
    ttl: 10 * 60 * 1000,       // 10 minutos
    minInterval: 5 * 60 * 1000 // 5 minutos
  },
  estadoRenovacion: {
    ttl: 5 * 60 * 1000,        // 5 minutos
    minInterval: 2 * 60 * 1000 // 2 minutos
  },
  asistencias: {
    ttl: 1 * 60 * 1000,        // 1 minuto (ya implementado)
    minInterval: 30 * 1000     // 30 segundos
  }
};
