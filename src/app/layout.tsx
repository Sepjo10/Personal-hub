import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Cada página puede definir su título; se mostrará como "Hoy · Personal Hub"
  title: { default: "Personal Hub", template: "%s · Personal Hub" },
  description: "Dashboard personal de organización diaria, académica y personal.",
  applicationName: "Personal Hub",
  // iPhone: permite abrirla a pantalla completa desde "Añadir a pantalla de inicio"
  appleWebApp: { capable: true, title: "Personal Hub", statusBarStyle: "black-translucent" },
};

// Color de la barra del sistema en el móvil y controles nativos oscuros
export const viewport: Viewport = {
  themeColor: "#14121c",
  colorScheme: "dark",
};

// Layout raíz: solo define <html>, <body>, fuentes y estilos globales.
// La estructura de la app (menú, navegación) está en src/app/(app)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
