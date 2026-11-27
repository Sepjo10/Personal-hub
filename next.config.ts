import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad para todas las respuestas:
 * - X-Frame-Options / frame-ancestors: nadie puede meter la app en un iframe (clickjacking).
 * - X-Content-Type-Options: el navegador no "adivina" tipos de archivo.
 * - Referrer-Policy: a otras webs solo se envía el dominio, nunca la ruta ni ?fecha=...
 * - Permissions-Policy: la app no usa cámara, micrófono ni ubicación.
 * - Strict-Transport-Security: obliga a usar HTTPS (el navegador lo ignora en localhost con http).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false, // no anunciar "X-Powered-By: Next.js"
  serverExternalPackages: ["web-push"], // librería de Node: se carga tal cual en el servidor
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
