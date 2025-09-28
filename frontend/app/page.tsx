import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">Bienvenido al Gimnasio</h1>
        <p className="text-center">Selecciona tu tipo de acceso:</p>
        <div className="flex flex-col gap-4">
          <Link
            href="/login-admin"
            className="btn btn-primary w-full text-center"
          >
            Acceso Administrador
          </Link>
          <Link
            href="/login-profesor"
            className="btn btn-secondary w-full text-center"
          >
            Acceso Profesor
          </Link>
          <Link
            href="/login-alumno"
            className="btn btn-accent w-full text-center"
          >
            Acceso Alumno
          </Link>
        </div>
      </div>
    </main>
  );
}
