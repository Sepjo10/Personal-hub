"use client";

import { useEffect } from "react";

/**
 * Registra el service worker (public/sw.js). Solo en producción:
 * en desarrollo (npm run dev) un service worker puede servir páginas
 * antiguas y confundir mientras programamos.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);
  return null;
}
