// Sistema de eventos personalizados para sincronización entre componentes

export function notifyPerfilActualizado(data?: unknown) {
  window.dispatchEvent(new CustomEvent('perfilActualizado', { 
    detail: { data, timestamp: Date.now() } 
  }));
}

export function notifyAvisosActualizados(data?: unknown) {
  window.dispatchEvent(new CustomEvent('avisosActualizados', { 
    detail: { data, timestamp: Date.now() } 
  }));
}

export function notifyPlanActualizado(data?: unknown) {
  window.dispatchEvent(new CustomEvent('planActualizado', { 
    detail: { data, timestamp: Date.now() } 
  }));
}

export function notifyRenovacionActualizada(data?: unknown) {
  window.dispatchEvent(new CustomEvent('renovacionActualizada', { 
    detail: { data, timestamp: Date.now() } 
  }));
}

// Función genérica para notificar actualizaciones de datos
export function notifyDataUpdated(type: 'perfil' | 'avisos' | 'plan' | 'renovacion' | 'asistencias', data?: unknown) {
  const eventName = `${type}Actualizado${type === 'avisos' ? 's' : ''}`;
  window.dispatchEvent(new CustomEvent(eventName, { 
    detail: { data, timestamp: Date.now() } 
  }));
}
