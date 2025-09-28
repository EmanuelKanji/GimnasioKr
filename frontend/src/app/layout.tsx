import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GimnasioKr - Sistema de Gestión de Gimnasio",
  description: "Plataforma web para control de asistencia, administración de usuarios, planes y avisos en gimnasios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
