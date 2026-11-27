/**
 * Service worker de Personal Hub.
 * Decisión de seguridad: NO se guardan en caché páginas ni datos privados
 * (tareas, finanzas...). Si alguien coge el móvil sin sesión, no hay nada
 * guardado que leer. Solo se cachea una página "Sin conexión" para cuando no hay red.
 */
const CACHE = "personal-hub-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Borra cachés de versiones antiguas del service worker
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Solo navegaciones (abrir una página). Lo demás va directo a la red.
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});

// Llega una notificación push del servidor (resumen diario o prueba)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Personal Hub", {
      body: data.body || "",
      // Sin "icon": en Android sale como imagen grande a la derecha y repetía el logo.
      // badge = icono pequeño monocromo de la izquierda y de la barra de estado.
      badge: "/icons/badge-96.png",
      tag: data.tag || "personal-hub",
      data: { url: data.url || "/" },
    }),
  );
});

// Al pulsar una notificación: enfoca la app si está abierta o la abre en la URL indicada
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (open) return open.focus().then((w) => w.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});
