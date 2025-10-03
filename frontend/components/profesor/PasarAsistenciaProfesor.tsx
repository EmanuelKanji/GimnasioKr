'use client';
import { useRef, useState, useEffect } from 'react';
import Html5QrReader from '../admin/Html5QrReader';
import styles from './PasarAsistenciaProfesor.module.css';

export default function PasarAsistencia() {
  const [qrResult, setQrResult] = useState('');
  const [rut, setRut] = useState('');
  const [rutResult, setRutResult] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado para mostrar el lector QR
  const [showCamera, setShowCamera] = useState(false);


  // Registrar asistencia al escanear QR con cámara (sistema mejorado con validaciones)
  const handleScanCamera = async (data: string | null | undefined) => {
    if (!data || data === 'undefined') return; // Evita procesar "undefined" string
    
    const token = localStorage.getItem('token');
    let rutParaEnviar = data;
    let qrDataParaEnviar = null;
    
    try {
      // Intentar parsear como JSON (nuevo formato con timestamp y token)
      const datosQR = JSON.parse(data);
      
      // Si tiene la estructura del nuevo QR, extraer RUT y enviar datos completos
      if (datosQR.rut && datosQR.timestamp) {
        rutParaEnviar = datosQR.rut;
        qrDataParaEnviar = data; // Enviar QR completo para validaciones adicionales
        
        console.log('📱 QR nuevo formato detectado:', {
          rut: datosQR.rut,
          plan: datosQR.plan,
          generado: new Date(datosQR.timestamp).toLocaleString(),
          expira: new Date(datosQR.expiraEn).toLocaleString()
        });
      }
    } catch {
      // Si no se puede parsear, asumir que es solo un RUT (formato legacy)
      console.log('📱 QR formato legacy detectado (solo RUT):', data);
    }
    
    try {
      // Enviar solicitud al backend con validaciones mejoradas
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          rut: rutParaEnviar,
          qrData: qrDataParaEnviar // Datos adicionales para validación de seguridad
        })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        // Mostrar resultado exitoso con información detallada
        const mensaje = `✅ Asistencia registrada exitosamente
        
👤 Alumno: ${result.asistencia?.alumno || 'N/A'}
🆔 RUT: ${result.asistencia?.rut || rutParaEnviar}
📅 Fecha: ${result.asistencia?.fecha || 'Hoy'}
⏰ Hora: ${result.asistencia?.hora || new Date().toLocaleTimeString('es-CL')}
💼 Plan: ${result.asistencia?.plan || 'N/A'}`;
        
        setQrResult(mensaje);
        
        // Notificar a otros componentes que se registró una asistencia
        window.dispatchEvent(new CustomEvent('asistenciaRegistrada', {
          detail: {
            timestamp: new Date().toISOString(),
            rut: result.asistencia?.rut || rutParaEnviar,
            alumno: result.asistencia?.alumno || 'N/A',
            fecha: result.asistencia?.fecha || 'Hoy'
          }
        }));
        
        // Limpiar resultado después de 5 segundos
        setTimeout(() => {
          setQrResult('');
        }, 5000);
        
      } else {
        // Mostrar errores específicos según el código de error
        let mensajeError = `❌ Error: ${result.message}`;
        
        switch (result.codigo) {
          case 'PLAN_EXPIRADO':
            mensajeError = `🚫 Plan expirado\n\n${result.message}\n\nEl alumno debe renovar su plan.`;
            break;
          case 'QR_EXPIRADO':
            mensajeError = `⏰ QR expirado\n\n${result.message}\n\nSolicita al alumno que genere un nuevo QR.`;
            break;
          case 'ASISTENCIA_YA_REGISTRADA':
            mensajeError = `✅ Ya registrado\n\nEste alumno ya registró asistencia hoy (${result.fecha}).`;
            break;
          case 'ALUMNO_NO_ENCONTRADO':
            mensajeError = `❓ Alumno no encontrado\n\nVerifica que el RUT sea correcto: ${rutParaEnviar}`;
            break;
          default:
            mensajeError = `❌ Error: ${result.message}`;
        }
        
        setQrResult(mensajeError);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setQrResult('🌐 Error de conexión con el servidor.\n\nVerifica tu conexión a internet.');
    }
  };

  // Simulación de lectura QR por escáner físico (input)
  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rutQR = e.target.value;
    setQrResult(rutQR);
    const token = localStorage.getItem('token');
    try {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rut: rutQR })
      });
      const data = await res.json();
      if (res.ok) {
        setQrResult(`${rutQR} - ${new Date().toLocaleString()}`);
      } else {
        setQrResult(`Error: ${data.message}`);
      }
    } catch {
      setQrResult('Error de conexión con el servidor.');
    }
    e.target.value = '';
  };

  // Pasar asistencia por RUT
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(e.target.value);
  };
  
  const handleRutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rut })
      });
      const data = await res.json();
      if (res.ok) {
        setRutResult(`${rut} - ${new Date().toLocaleString()}`);
      } else {
        setRutResult(`Error: ${data.message}`);
      }
    } catch {
      setRutResult('Error de conexión con el servidor.');
    }
    setRut('');
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Pasar Asistencia (QR o RUT)</h2>
      
      <button className={styles.cameraButton} onClick={() => setShowCamera(!showCamera)} type="button">
        <span className={styles.cameraIcon}>📷</span>
        {showCamera ? 'Cerrar cámara QR' : 'Abrir cámara para escanear QR'}
      </button>
      {showCamera && (
        <div className={styles.qrSection}>
          <Html5QrReader onScan={handleScanCamera} />
        </div>
      )}
      
      <div className={styles.qrSection}>
        <label htmlFor="qr-input" className={styles.sectionLabel}>
          O escanea el QR con el lector físico:
        </label>
        <input
          id="qr-input"
          ref={inputRef}
          type="text"
          placeholder="Enfoca el lector aquí y escanea el QR"
          className={styles.qrInput}
          onChange={handleInput}
          autoFocus
        />
      </div>
      
      <div className={styles.separator}>O</div>
      
      <form onSubmit={handleRutSubmit} className={styles.rutForm}>
        <label htmlFor="rut-input" className={styles.rutLabel}>
          Ingresa el RUT del alumno:
        </label>
        <input
          id="rut-input"
          type="text"
          placeholder="RUT del alumno"
          className={styles.rutInput}
          value={rut}
          onChange={handleRutChange}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Registrar Asistencia por RUT
        </button>
      </form>
      
      {qrResult && (
        <div className={`${styles.resultAlert} ${styles.resultSuccess}`}>
          <div className={styles.resultContent}>
            <span className={styles.resultIcon}>✅</span>
            <div className={styles.resultText}>
              Último QR leído: 
              <span className={styles.monoText}>{qrResult}</span>
            </div>
          </div>
        </div>
      )}
      
      {rutResult && (
        <div className={`${styles.resultAlert} ${styles.resultSuccess}`}>
          <div className={styles.resultContent}>
            <span className={styles.resultIcon}>✅</span>
            <div className={styles.resultText}>
              Último RUT registrado: 
              <span className={styles.monoText}>{rutResult}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
