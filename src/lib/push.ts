// web-push es CommonJS y se carga fuera del bundle (serverExternalPackages):
// con "import webpush from" el valor por defecto llega undefined, así que se importa el módulo entero.
import * as webpush from "web-push";

/**
 * Envío de notificaciones Web Push (solo servidor).
 * Las claves VAPID identifican a Personal Hub ante el servicio push del
 * navegador (en Android, el de Google): solo quien tiene la clave privada
 * puede enviar notificaciones a tus dispositivos.
 */
export type PushPayload = { title: string; body: string; url?: string; tag?: string };
export type PushTarget = { endpoint: string; keys: { p256dh: string; auth: string } };

export const isPushConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);

let configured = false;
function configure() {
  if (configured) return;
  if (!isPushConfigured()) throw new Error("Faltan las variables VAPID en el entorno.");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  configured = true;
}

/**
 * "gone": el dispositivo ya no existe (desinstalaste la app o quitaste el permiso): hay que borrarlo.
 * "config": faltan las claves VAPID o tienen un formato no válido.
 * Nunca lanza errores: quien llama decide qué mensaje mostrar.
 */
export async function sendPush(target: PushTarget, payload: PushPayload): Promise<"ok" | "gone" | "error" | "config"> {
  try {
    configure();
  } catch (error) {
    console.error("Push: configuración VAPID no válida:", error instanceof Error ? error.message : error);
    return "config";
  }
  try {
    await webpush.sendNotification(target, JSON.stringify(payload), { TTL: 6 * 3600, urgency: "normal" });
    return "ok";
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return "gone";
    console.error("Push fallido:", status, error);
    return "error";
  }
}
