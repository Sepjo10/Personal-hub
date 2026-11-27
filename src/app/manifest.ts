import type { MetadataRoute } from "next";

/**
 * Manifest de la PWA (Next lo sirve en /manifest.webmanifest).
 * Le dice al móvil cómo instalar la app: nombre, iconos, colores y que se abra
 * a pantalla completa ("standalone"), sin la barra del navegador.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Personal Hub",
    short_name: "Hub",
    description: "Dashboard personal de organización diaria, académica y personal.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14121c",
    theme_color: "#14121c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // "maskable": Android recorta el icono con su forma (círculo, gota...) sin cortar el dibujo
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Accesos directos al mantener pulsado el icono
    shortcuts: [
      { name: "Hoy", url: "/planificador/hoy", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Notas", url: "/notas", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Finanzas", url: "/finanzas", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
