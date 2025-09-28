import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              GimnasioKr
            </h1>
            <p className="text-blue-200 text-lg mb-8">
              Sistema de Gestión de Gimnasio
            </p>
            <div className="space-y-4">
              <Link 
                href="/auth/login"
                className="w-full bg-white text-blue-900 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition duration-200 block text-center"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/attendance"
                className="w-full bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 block text-center border border-blue-600"
              >
                Registrar Asistencia
              </Link>
            </div>
            <div className="mt-8 text-blue-200 text-sm">
              <p>Control de asistencia por QR y RUT</p>
              <p>Paneles para administrador, profesor y alumno</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
