"use server";

import { getCurrentUser } from "@/lib/auth";
import { sendPush } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

export type PushActionResult = { ok: boolean; error?: string; sent?: number };

type SubscriptionInput = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

const asText = (value: unknown, max: number) => (typeof value === "string" && value.length <= max ? value : "");

/** Guarda este dispositivo. Se valida todo: lo manda el navegador y no nos fiamos. */
export async function savePushSubscription(input: SubscriptionInput): Promise<PushActionResult> {
  await getCurrentUser();
  const endpoint = asText(input?.endpoint, 1000);
  const p256dh = asText(input?.keys?.p256dh, 200);
  const auth = asText(input?.keys?.auth, 100);
  if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) return { ok: false, error: "Suscripción no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert({ endpoint, p256dh, auth }, { onConflict: "endpoint" });
  if (error) return { ok: false, error: "No se pudo activar en este dispositivo." };
  return { ok: true };
}

export async function deletePushSubscription(endpoint: string): Promise<PushActionResult> {
  await getCurrentUser();
  if (typeof endpoint !== "string" || endpoint.length > 1000) return { ok: false, error: "Suscripción no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return { ok: false, error: "No se pudo desactivar." };
  return { ok: true };
}

/** Notificación de prueba a todos MIS dispositivos (RLS: solo se leen los míos). */
export async function sendTestPush(): Promise<PushActionResult> {
  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (error) return { ok: false, error: "No se pudieron leer tus dispositivos." };

  let sent = 0;
  let configError = false;
  for (const s of data ?? []) {
    const result = await sendPush(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      { title: "Personal Hub", body: "¡Las notificaciones funcionan! Cada mañana recibirás el resumen de tu día.", url: "/", tag: "test" },
    );
    if (result === "ok") sent++;
    if (result === "gone") await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
    if (result === "config") configError = true;
  }
  if (sent > 0) return { ok: true, sent };
  if (configError) return { ok: false, error: "Las claves VAPID del servidor faltan o no son válidas. Revisa las variables en Vercel." };
  if ((data ?? []).length === 0) return { ok: false, error: "No hay ningún dispositivo activo. Pulsa Desactivar y vuelve a Activar." };
  return { ok: false, error: "No se pudo enviar la notificación. Mira los Logs de Vercel." };
}
