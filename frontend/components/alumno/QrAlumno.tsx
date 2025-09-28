import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrAlumnoProps {
  rut: string;
  plan: string;
  fechaInicio: string;
  fechaFin: string;
}

export default function QrAlumno({ rut, plan, fechaInicio, fechaFin }: QrAlumnoProps) {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    setActivo(hoy >= inicio && hoy <= fin);
  }, [fechaInicio, fechaFin]);

  if (!activo) {
    return <div>El QR no está disponible. Tu plan está inactivo.</div>;
  }

  const qrData = JSON.stringify({ rut, plan, validoDesde: fechaInicio, validoHasta: fechaFin });

  return (
    <div>
      <h2>Tu código QR</h2>
      <QRCodeSVG value={qrData} size={256} />
      <p>Válido desde: {new Date(fechaInicio).toLocaleDateString('es-CL')}</p>
      <p>Válido hasta: {new Date(fechaFin).toLocaleDateString('es-CL')}</p>
    </div>
  );
}
