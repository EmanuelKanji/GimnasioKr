'use client';
import { useRef, useState } from 'react';
import Html5QrReader from '../admin/Html5QrReader';
import styles from './PasarAsistenciaProfesor.module.css';

export default function PasarAsistencia() {
  const [qrResult, setQrResult] = useState('');
  const [rut, setRut] = useState('');
  const [rutResult, setRutResult] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado para mostrar el lector QR
  const [showCamera, setShowCamera] = useState(false);

  // Registrar asistencia al escanear QR con cámara
  const handleScanCamera = async (data: string | null | undefined) => {
    if (!data || data === 'undefined') return; // Evita procesar "undefined" string
    setQrResult(data);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:4000/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rut: data })
      });
      const result = await res.json();
      if (res.ok) {
        setQrResult(`${data} - ${new Date().toLocaleString()}`);
      } else {
        setQrResult(`Error: ${result.message}`);
      }
    } catch {
      setQrResult('Error de conexión con el servidor.');
    }
  };

  // Simulación de lectura QR por escáner físico (input)
  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rutQR = e.target.value;
    setQrResult(rutQR);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:4000/api/asistencias', {
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
      const res = await fetch('http://localhost:4000/api/asistencias', {
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
