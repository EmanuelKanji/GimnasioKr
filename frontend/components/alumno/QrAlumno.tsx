import { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './QrAlumno.module.css';

interface QrAlumnoProps {
  rut: string;
  plan: string;
  fechaInicio: string;
  fechaFin: string;
}

export default function QrAlumno({ rut, plan, fechaInicio, fechaFin }: QrAlumnoProps) {
  const [activo, setActivo] = useState(false);
  const [qrData, setQrData] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(0);

  // Función para generar un token temporal único
  const generarTokenTemporal = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Función para generar nuevo QR con timestamp y token temporal
  const generarNuevoQR = useCallback(() => {
    const ahora = Date.now();
    const tiempoExpiracion = 5 * 60 * 1000; // 5 minutos en milisegundos
    const expiraEn = ahora + tiempoExpiracion;
    
    // Crear datos del QR con medidas de seguridad mejoradas
    const datosQR = {
      rut,
      plan,
      validoDesde: fechaInicio,
      validoHasta: fechaFin,
      timestamp: ahora,           // Momento de generación
      expiraEn: expiraEn,        // Cuándo expira el QR
      token: generarTokenTemporal(), // Token único para esta sesión
      version: '2.0'             // Versión para futuras validaciones
    };

    setQrData(JSON.stringify(datosQR));
    setTiempoRestante(tiempoExpiracion);
  }, [rut, plan, fechaInicio, fechaFin]);

  // Verificar si el plan está activo
  useEffect(() => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const planActivo = hoy >= inicio && hoy <= fin;
    
    setActivo(planActivo);
    
    // Solo generar QR si el plan está activo
    if (planActivo) {
      generarNuevoQR();
    }
  }, [fechaInicio, fechaFin, rut, plan, generarNuevoQR]);

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

  // Si el plan no está activo, mostrar mensaje de error
  if (!activo) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>🔒 Mi QR</h2>
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>❌ QR no disponible</h3>
          <div className={styles.errorMessage}>
            <p>Tu plan está inactivo o ha expirado.</p>
            <p>Por favor, renueva tu plan para acceder al gimnasio.</p>
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
              <span className={styles.planValue}>{plan}</span>
            </div>
            <div className={styles.planDetail}>
              <span className={styles.planLabel}>Válido desde:</span>
              <span className={styles.planValue}>{new Date(fechaInicio).toLocaleDateString('es-CL')}</span>
            </div>
            <div className={styles.planDetail}>
              <span className={styles.planLabel}>Válido hasta:</span>
              <span className={styles.planValue}>{new Date(fechaFin).toLocaleDateString('es-CL')}</span>
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
