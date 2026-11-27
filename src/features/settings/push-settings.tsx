"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePushSubscription, savePushSubscription, sendTestPush } from "./push-actions";

type Status = "loading" | "unsupported" | "denied" | "off" | "on";

/** Comprueba si este navegador admite push y si este dispositivo ya está suscrito. */
async function detectStatus(): Promise<Status> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription ? "on" : "off";
}

const DESCRIPTIONS: Record<Status, string> = {
  loading: "Comprobando este dispositivo…",
  unsupported: "Este navegador no admite notificaciones push. En Android, instala la app desde Chrome.",
  denied: "Has bloqueado las notificaciones. Actívalas en los ajustes del navegador para este sitio.",
  off: "Recibe cada mañana un resumen de tus tareas, clases y entregas del día.",
  on: "Activadas en este dispositivo. Cada mañana recibirás el resumen del día.",
};

/** Notificaciones (cliente): activar/desactivar en ESTE dispositivo y enviar una prueba. */
export function PushSettings({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<{ text: string; ok: boolean }>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    detectStatus().then(setStatus);
  }, []);

  function enable() {
    startTransition(async () => {
      setMessage(undefined);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // obligatorio: cada push muestra una notificación visible
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });
      const res = await savePushSubscription(subscription.toJSON());
      if (!res.ok) {
        await subscription.unsubscribe();
        setMessage({ text: res.error ?? "No se pudo activar.", ok: false });
        return;
      }
      setStatus("on");
    });
  }

  function disable() {
    startTransition(async () => {
      setMessage(undefined);
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    });
  }

  function test() {
    startTransition(async () => {
      const res = await sendTestPush();
      setMessage(res.ok ? { text: `Enviada a ${res.sent} dispositivo(s).`, ok: true } : { text: res.error ?? "No se pudo enviar.", ok: false });
    });
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Bell className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Notificaciones</p>
          <p className="text-sm text-muted-foreground">
            {configured ? DESCRIPTIONS[status] : "Faltan las variables VAPID en el entorno."}
          </p>
        </div>
        {configured && status === "off" && <Button variant="outline" disabled={pending} onClick={enable}>{pending ? "Activando…" : "Activar"}</Button>}
        {configured && status === "on" && (
          <div className="flex gap-2">
            <Button variant="outline" disabled={pending} onClick={test}>Probar</Button>
            <Button variant="ghost" disabled={pending} onClick={disable} className="text-muted-foreground">Desactivar</Button>
          </div>
        )}
      </div>
      {message && (
        <p role="status" className={message.ok ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-destructive"}>{message.text}</p>
      )}
    </section>
  );
}
