import { Suspense } from "react";
import { Bell, CalendarDays, Palette, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/logout-button";
import { getCurrentUser } from "@/lib/auth";

type SettingsSection = { icon: LucideIcon; title: string; description: React.ReactNode; phase?: string; action?: string };

const sections: SettingsSection[] = [
  { icon: Palette, title: "Apariencia", description: "Modo oscuro activado. El tema claro se valorará más adelante." },
  { icon: Bell, title: "Notificaciones", description: "Recordatorios de tareas y eventos.", phase: "Fase 7" },
  { icon: CalendarDays, title: "Google Calendar", description: "Muestra tus eventos de Google en el planificador.", phase: "Fase 6", action: "Conectar" },
  {
    icon: UserRound,
    title: "Cuenta",
    description: (
      <Suspense fallback={<span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10" />}>
        <AccountEmail />
      </Suspense>
    ),
  },
];

/** Lee el usuario en el servidor; va dentro de <Suspense> porque depende de la petición (cookies). */
async function AccountEmail() {
  const user = await getCurrentUser();
  return <>Conectado como {user.email}</>;
}

/** Configuración: opciones previstas y cuenta del usuario. */
export function SettingsView() {
  return (
    <div className="max-w-2xl space-y-3">
      {sections.map(({ icon: Icon, title, description, phase, action }) => (
        <section key={title} className="glass flex items-center gap-4 rounded-2xl p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {action ? (
            <Button variant="outline" disabled>{action}</Button>
          ) : (
            phase && <span className="text-xs text-muted-foreground">{phase}</span>
          )}
        </section>
      ))}
      <LogoutButton className="glass mt-2 w-auto rounded-2xl px-5 py-3 text-destructive hover:text-destructive" />
    </div>
  );
}
