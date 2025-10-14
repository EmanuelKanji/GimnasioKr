import { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './QrAlumno.module.css';
import { calcularLimiteClases, obtenerMensajeLimite, obtenerColorIndicador, type LimiteClases } from '../../lib/classLimits';
import { useEstadoRenovacion } from '../../hooks/useEstadoRenovacion';
import type { Plan } from '../../../shared/types';

interface QrAlumnoProps {
  rut: string;
  plan: string;
  fechaInicio: string;
  fechaFin: string;
  limiteClases?: LimiteClases;
  asistenciasMes?: string[];
  planCompleto?: Plan | null;
}

export default function QrAlumno({ rut, plan, fechaInicio, fechaFin, limiteClases = 'todos_los_dias', asistenciasMes = [], planCompleto }: QrAlumnoProps) {
  const [activo, setActivo] = useState(false);
  const [qrData, setQrData] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(0);
  
  // Usar hook centralizado para estado de renovación
  const { estado: estadoRenovacion, updateEstado } = useEstadoRenovacion();

  // Usar datos del plan real si está disponible
  const nombrePlanReal = planCompleto?.nombre || plan;
  const descripcionPlan = planCompleto?.descripcion || '';
  const limiteReal = planCompleto?.limiteClases || limiteClases;

  // Función para generar un token temporal único
  const generarTokenTemporal = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Función para solicitar renovación
  const solicitarRenovacion = async () => {
    console.log('🔄 Iniciando solicitud de renovación...');
    updateEstado('procesando');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No hay token en localStorage');
        updateEstado('ninguno');
        return;
      }
      
      const hoy = new Date();
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const planActivo = hoy >= inicio && hoy <= fin;
      const motivo = !planActivo ? 'plan_expirado' : 'limite_alcanzado';
      
      console.log('📋 Datos de la solicitud:', {
        motivo,
        planActivo,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        hoy: hoy.toISOString()
      });
      
      const requestData = {
        motivo,
        fechaSolicitud: new Date().toISOString()
      };
      
      console.log('📤 Enviando solicitud:', requestData);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alumnos/me/solicitar-renovacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('📡 Respuesta del servidor:', {
        status: res.status,
        ok: res.ok
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Solicitud exitosa:', data);
        updateEstado('solicitada');
      } else {
        const errorData = await res.json();
        console.error('❌ Error solicitando renovación:', errorData);
        updateEstado('ninguno');
      }
    } catch (error) {
      console.error('❌ Error solicitando renovación:', error);
      updateEstado('ninguno');
    }
  };

  // Función para limpiar RUT (quitar puntos y guiones)
  const limpiarRut = (r: string) => r.replace(/\.|-/g, '').toUpperCase();

  // Función para generar nuevo QR con timestamp y token temporal
  const generarNuevoQR = useCallback(() => {
    const ahora = Date.now();
    const tiempoExpiracion = 10 * 60 * 1000; // 10 minutos en milisegundos (sincronizado con backend)
    const expiraEn = ahora + tiempoExpiracion;
    
    // Validar fechas antes de generar QR
    const fechaInicioPlan = new Date(fechaInicio);
    const fechaFinPlan = new Date(fechaFin);
    const fechaActual = new Date();
    
    // Si las fechas del perfil están expiradas, usar fechas actuales para el QR
    // El backend ya validará las fechas reales del perfil del alumno
    let validoDesde, validoHasta;
    
    if (isNaN(fechaInicioPlan.getTime()) || isNaN(fechaFinPlan.getTime())) {
      // Fechas inválidas, usar fechas por defecto
      validoDesde = fechaActual.toISOString();
      validoHasta = new Date(fechaActual.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString(); // 30 días
    } else if (fechaActual > fechaFinPlan) {
      // Plan expirado según perfil, usar fechas actuales para QR
      validoDesde = fechaActual.toISOString();
      validoHasta = new Date(fechaActual.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString(); // 30 días
    } else {
      // Fechas válidas, usar las del perfil
      validoDesde = fechaInicioPlan.toISOString();
      validoHasta = fechaFinPlan.toISOString();
    }
    
    // Crear datos del QR con medidas de seguridad mejoradas
    const datosQR = {
      rut: limpiarRut(rut), // RUT limpio para compatibilidad con backend
      plan,
      validoDesde,          // Fechas validadas y corregidas
      validoHasta,          // Fechas validadas y corregidas
      timestamp: ahora,           // Momento de generación
      expiraEn: expiraEn,        // Cuándo expira el QR
      token: generarTokenTemporal(), // Token único para esta sesión
      version: '2.0'             // Versión para futuras validaciones
    };

    // Debug: Verificar formato de fechas
    console.log('🔍 QR Fechas Debug:', {
      fechaInicioOriginal: fechaInicio,
      fechaFinOriginal: fechaFin,
      fechaInicioPlan: fechaInicioPlan.toISOString(),
      fechaFinPlan: fechaFinPlan.toISOString(),
      fechaActual: fechaActual.toISOString(),
      planExpirado: fechaActual > fechaFinPlan,
      validoDesde: validoDesde,
      validoHasta: validoHasta,
      datosQR: datosQR,
      qrStringificado: JSON.stringify(datosQR),
      longitudQR: JSON.stringify(datosQR).length
    });

    setQrData(JSON.stringify(datosQR));
    setTiempoRestante(tiempoExpiracion);
  }, [rut, plan, fechaInicio, fechaFin]);

  // Calcular información de límites de clases usando el límite real del plan
  const limiteInfoCalculado = calcularLimiteClases(limiteReal, asistenciasMes, new Date(), fechaInicio, fechaFin);
  const mensajeLimite = obtenerMensajeLimite(limiteReal, asistenciasMes, new Date(), fechaInicio, fechaFin);
  const colorIndicador = obtenerColorIndicador(limiteReal, asistenciasMes, new Date(), fechaInicio, fechaFin);

  // Debug: Log de información para verificar datos
  console.log('🔍 QR Debug Info:', {
    rutOriginal: rut,
    rutLimpio: limpiarRut(rut),
    plan,
    planCompleto,
    nombrePlanReal,
    descripcionPlan,
    limiteReal,
    fechaInicio,
    fechaFin,
    limiteClases,
    asistenciasMesTotal: asistenciasMes.length,
    asistenciasMes: asistenciasMes,
    limiteInfo: limiteInfoCalculado,
    mensajeLimite,
    colorIndicador
  });

  // El hook useEstadoRenovacion ya maneja la verificación automática
  // No necesitamos useEffect adicional ni setInterval

  // Verificar si el plan está activo y si puede acceder hoy
  useEffect(() => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const planActivo = hoy >= inicio && hoy <= fin;
    
    // Verificar si puede acceder hoy según los límites de clases
    const puedeAccederHoy = limiteInfoCalculado.puedeAcceder;
    
    // Debug: Log del estado del QR
    console.log('🔍 QR Estado Debug:', {
      hoy: hoy.toISOString(),
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      planActivo,
      puedeAccederHoy,
      activo: planActivo && puedeAccederHoy,
      estadoRenovacion,
      motivo: !planActivo ? 'plan_expirado' : 'limite_alcanzado'
    });
    
    setActivo(planActivo && puedeAccederHoy);
    
    // Solo generar QR si el plan está activo y puede acceder
    if (planActivo && puedeAccederHoy) {
      generarNuevoQR();
    }
  }, [fechaInicio, fechaFin, rut, plan, limiteInfoCalculado.puedeAcceder, generarNuevoQR, estadoRenovacion]);

  // Contador regresivo para mostrar tiempo restante del QR
  useEffect(() => {
    if (tiempoRestante <= 0) return;

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1000) {
          // QR expirado, generar uno nuevo automáticamente
          generarNuevoQR();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoRestante, generarNuevoQR]);

  // Si el plan no está activo o no puede acceder, mostrar mensaje de error
  if (!activo) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const planActivo = hoy >= inicio && hoy <= fin;
    
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>🔒 Mi QR</h2>
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>❌ QR no disponible</h3>
          <div className={styles.errorMessage}>
            {!planActivo ? (
              <>
                <p>Tu plan está inactivo o ha expirado.</p>
                <p>Por favor, renueva tu plan para acceder al gimnasio.</p>
                <div className={styles.renovacionSection}>
                  <button 
                    onClick={() => {
                      console.log('🖱️ Botón de renovación clickeado');
                      solicitarRenovacion();
                    }}
                    className={styles.renovarBtn}
                    disabled={estadoRenovacion === 'procesando'}
                  >
                    {estadoRenovacion === 'procesando' ? '⏳ Enviando...' : '🔄 Solicitar Renovación'}
                  </button>
                  <p className={styles.instrucciones}>
                    Contacta al administrador con tu comprobante de pago
                  </p>
                  <p className={styles.debugInfo}>
                    Debug: Estado renovación = {estadoRenovacion}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p>Has alcanzado el límite de clases de tu plan.</p>
                <p>{mensajeLimite}</p>
                <div className={styles.limiteInfo}>
                  <div className={styles.limiteStats}>
                    <span>Clases usadas: {limiteInfoCalculado.diasUsados} de {limiteInfoCalculado.diasDisponibles}</span>
                    <span>Clases restantes: {limiteInfoCalculado.diasRestantes}</span>
                  </div>
                  <div className={styles.limiteMessage}>
                    {mensajeLimite}
                  </div>
                </div>
                <div className={styles.renovacionSection}>
                  <button 
                    onClick={() => {
                      console.log('🖱️ Botón de renovación (límite) clickeado');
                      solicitarRenovacion();
                    }}
                    className={styles.renovarBtn}
                    disabled={estadoRenovacion === 'procesando'}
                  >
                    {estadoRenovacion === 'procesando' ? '⏳ Enviando...' : '🔄 Solicitar Renovación'}
                  </button>
                  <p className={styles.debugInfo}>
                    Debug: Estado renovación = {estadoRenovacion}
                  </p>
                </div>
              </>
            )}
            
            {estadoRenovacion === 'solicitada' && (
              <div className={styles.solicitudEnviada}>
                <p>✅ Solicitud enviada exitosamente</p>
                <p>El administrador revisará tu pago y renovará tu plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Formatear tiempo restante para mostrar al usuario
  const formatearTiempo = (milisegundos: number) => {
    const minutos = Math.floor(milisegundos / 60000);
    const segundos = Math.floor((milisegundos % 60000) / 1000);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔒 Tu código QR seguro</h2>
      
      {/* Mostrar QR solo si hay datos válidos */}
      {qrData ? (
        <div className={styles.qrContainer}>
          {/* QR Code */}
          <div className={styles.qrBox}>
            <QRCodeSVG value={qrData} size={200} />
          </div>
          
          {/* Timer Container */}
          <div className={`${styles.timerContainer} ${tiempoRestante < 60000 ? styles.expiring : ''}`}>
            <div className={styles.timerTitle}>
              ⏱️ Tiempo restante
            </div>
            <div className={styles.timerValue}>
              {formatearTiempo(tiempoRestante)}
            </div>
            <div className={styles.timerSubtext}>
              Este QR se regenera automáticamente por seguridad
            </div>
          </div>
          
          {/* Botón para regenerar QR manualmente */}
          <button 
            onClick={generarNuevoQR}
            className={styles.regenerateBtn}
          >
            🔄 Generar nuevo QR
          </button>
          
          {/* Información del plan */}
          <div className={styles.planInfo}>
            <h4>📋 Información del Plan</h4>
            <div className={styles.planDetail}>
              <span className={styles.planLabel}>Plan:</span>
              <span className={styles.planValue}>{nombrePlanReal}</span>
            </div>
            <div className={styles.planDetail}>
              <span className={styles.planLabel}>Válido desde:</span>
              <span className={styles.planValue}>{new Date(fechaInicio).toLocaleDateString('es-CL')}</span>
            </div>
            <div className={styles.planDetail}>
              <span className={styles.planLabel}>Válido hasta:</span>
              <span className={styles.planValue}>{new Date(fechaFin).toLocaleDateString('es-CL')}</span>
            </div>
            
            {/* Información de límites de clases */}
            <div className={styles.limiteClasesInfo}>
              <h5>🎯 Estado de tu Plan</h5>
              
              {/* Mostrar nombre y descripción del plan real */}
              <div className={styles.limiteDetail}>
                <span className={styles.limiteLabel}>Plan contratado:</span>
                <span className={styles.limiteValue}>{nombrePlanReal}</span>
              </div>
              
              {descripcionPlan && (
                <div className={styles.limiteDetail}>
                  <span className={styles.limiteLabel}>Descripción:</span>
                  <span className={styles.limiteValue}>{descripcionPlan}</span>
                </div>
              )}
              
              <div className={styles.limiteDetail}>
                <span className={styles.limiteLabel}>Límite del plan:</span>
                <span className={styles.limiteValue}>
                  {planCompleto?.clases ? `${planCompleto.clases} clases al mes` : 
                   limiteReal === '12' ? '12 clases al mes' : 
                   limiteReal === '8' ? '8 clases al mes' : 'Todos los días hábiles'}
                </span>
              </div>
              <div className={styles.limiteDetail}>
                <span className={styles.limiteLabel}>Clases usadas:</span>
                <span className={styles.limiteValue} style={{ color: colorIndicador }}>
                  {limiteInfoCalculado.diasUsados} de {limiteInfoCalculado.diasDisponibles}
                </span>
              </div>
              <div className={styles.limiteDetail}>
                <span className={styles.limiteLabel}>Clases restantes:</span>
                <span className={styles.limiteValue} style={{ color: colorIndicador }}>
                  {limiteInfoCalculado.diasRestantes}
                </span>
              </div>
              <div className={styles.limiteMessage}>
                {mensajeLimite}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingText}>Generando QR seguro...</div>
        </div>
      )}
    </div>
  );
}
