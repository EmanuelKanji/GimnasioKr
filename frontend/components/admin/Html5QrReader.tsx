import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRService } from '../../lib/qrService';

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
          
          // Usar servicio centralizado para procesar QR
          const result = QRService.processAndLogQR(decodedText, 'scanned');
          
          if (result.isValid) {
            if (result.type === 'new' && result.qrData) {
              // QR nuevo formato - enviar datos completos
              onScan(result.qrData);
            } else if (result.type === 'legacy') {
              // QR legacy - enviar solo RUT
              onScan(result.rut);
            }
          } else {
            // QR inválido - enviar texto original para debugging
            onScan(decodedText);
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
      () => {
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
