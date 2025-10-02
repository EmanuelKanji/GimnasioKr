import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Html5QrReaderProps {
  onScan: (data: string) => void;
}

import { useState } from 'react';

export default function Html5QrReader({ onScan }: Html5QrReaderProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(true);
  const scanOnceRef = useRef(false);

  useEffect(() => {
    if (!qrRef.current || !scanning) return;
    scannerRef.current = new Html5Qrcode(qrRef.current.id);
    scanOnceRef.current = false;
    scannerRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        if (scanOnceRef.current) return;
        if (decodedText) {
          scanOnceRef.current = true;
          
          // Intentar parsear como JSON (nuevo formato)
          try {
            const qrData = JSON.parse(decodedText);
            if (qrData.rut && qrData.timestamp) {
              // QR nuevo formato - enviar datos completos
              console.log('📱 QR nuevo formato escaneado:', qrData);
              onScan(decodedText); // Enviar JSON completo
            } else {
              // JSON pero sin estructura esperada, buscar RUT
              const rutMatch = decodedText.match(/(\d{1,2}\.??\d{3}\.??\d{3}-?[\dkK])/);
              if (rutMatch) {
                const cleanRut = rutMatch[1].replace(/\.|-/g, '');
                onScan(cleanRut);
              }
            }
          } catch {
            // No es JSON, buscar RUT directamente (formato legacy)
            const rutMatch = decodedText.match(/(\d{1,2}\.??\d{3}\.??\d{3}-?[\dkK])/);
            if (rutMatch) {
              const cleanRut = rutMatch[1].replace(/\.|-/g, '');
              console.log('📱 QR legacy escaneado:', cleanRut);
              onScan(cleanRut);
            } else {
              // Si no encuentra RUT, enviar texto completo
              console.log('📱 QR formato desconocido:', decodedText);
              onScan(decodedText);
            }
          }
          
          setScanning(false);
          
          // Detener el escáner
          if (scannerRef.current) {
            const state = scannerRef.current.getState && scannerRef.current.getState();
            if (state === 2 || state === 3) {
              await scannerRef.current.stop();
              await scannerRef.current.clear();
            } else {
              await scannerRef.current.clear();
            }
          }
        }
      },
      (error) => {
        // Puedes manejar errores aquí si lo deseas
      }
    );
    return () => {
      if (scannerRef.current) {
        const state = scannerRef.current.getState && scannerRef.current.getState();
        if (state === 2 || state === 3) {
          scannerRef.current.stop()
            .then(() => scannerRef.current?.clear())
            .catch(() => scannerRef.current?.clear());
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, [onScan, scanning]);

  return (
    <div>
      <div id="qr-reader" ref={qrRef} style={{ width: 300, margin: '0 auto' }} />
      {!scanning && (
        <button
          style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, background: '#0052ff', color: '#fff', border: 'none', cursor: 'pointer' }}
          onClick={() => setScanning(true)}
        >
          Reiniciar escaneo
        </button>
      )}
    </div>
  );
}
