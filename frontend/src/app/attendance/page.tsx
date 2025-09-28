'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AttendancePage() {
  const [attendanceMethod, setAttendanceMethod] = useState<'qr' | 'rut'>('rut');
  const [rut, setRut] = useState('');
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleRutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/attendance/rut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rut }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar asistencia');
      }

      setMessage(`✅ ${data.message} - ${data.user.nombre} ${data.user.apellido}`);
      setMessageType('success');
      setRut('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error inesperado');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/attendance/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar asistencia');
      }

      setMessage(`✅ ${data.message} - ${data.user.nombre} ${data.user.apellido}`);
      setMessageType('success');
      setQrData('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error inesperado');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Registro de Asistencia
              </h2>
              <p className="text-gray-600">
                Registra tu entrada y salida del gimnasio
              </p>
            </div>

            {message && (
              <div className={`border px-4 py-3 rounded mb-6 ${
                messageType === 'success' 
                  ? 'bg-green-100 border-green-400 text-green-700' 
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Method Selection */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setAttendanceMethod('rut')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    attendanceMethod === 'rut'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Por RUT
                </button>
                <button
                  onClick={() => setAttendanceMethod('qr')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    attendanceMethod === 'qr'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Por Código QR
                </button>
              </div>
            </div>

            {/* RUT Form */}
            {attendanceMethod === 'rut' && (
              <form onSubmit={handleRutSubmit} className="space-y-6">
                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                    RUT
                  </label>
                  <input
                    id="rut"
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    required
                    placeholder="12345678-9"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Formato: 12345678-9
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Asistencia'}
                </button>
              </form>
            )}

            {/* QR Form */}
            {attendanceMethod === 'qr' && (
              <form onSubmit={handleQrSubmit} className="space-y-6">
                <div>
                  <label htmlFor="qrData" className="block text-sm font-medium text-gray-700">
                    Datos del Código QR
                  </label>
                  <textarea
                    id="qrData"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    required
                    rows={4}
                    placeholder="Pega aquí los datos de tu código QR"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Puedes obtener tu código QR en tu panel de usuario
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Asistencia'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}