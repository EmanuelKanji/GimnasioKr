import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const generateQRCode = async (userId: string, rut: string): Promise<string> => {
  const qrData = {
    userId,
    rut,
    timestamp: Date.now(),
    uuid: uuidv4()
  };

  try {
    const qrString = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrString;
  } catch (error) {
    throw new Error('Error generando código QR');
  }
};

export const parseQRCode = (qrData: string): { userId: string; rut: string; timestamp: number; uuid: string } => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    throw new Error('Código QR inválido');
  }
};