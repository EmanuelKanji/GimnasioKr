/**
 * Hook para manejar notificaciones de asistencia en tiempo real
 */

import { useEffect } from 'react';

export const useAsistenciaNotification = () => {
  // Función para notificar que se registró una asistencia
  const notificarAsistenciaRegistrada = () => {
    // Emitir evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('asistenciaRegistrada', {
      detail: {
        timestamp: new Date().toISOString(),
        message: 'Asistencia registrada exitosamente'
      }
    }));
  };

  // Función para escuchar notificaciones de asistencia
  const escucharAsistenciaRegistrada = (callback: () => void) => {
    const handleAsistenciaUpdate = () => {
      callback();
    };

    window.addEventListener('asistenciaRegistrada', handleAsistenciaUpdate);
    
    return () => {
      window.removeEventListener('asistenciaRegistrada', handleAsistenciaUpdate);
    };
  };

  return {
    notificarAsistenciaRegistrada,
    escucharAsistenciaRegistrada
  };
};
