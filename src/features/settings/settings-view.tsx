import { Suspense } from "react";
import { Bell, Palette, UserRound, type LucideIcon } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";
import { getCurrentUser } from "@/lib/auth";
import type { SearchParams } from "@/features/planner/search-params";
import { GoogleSection } from "./google-section";

type SettingsSection = { icon: LucideIcon; title: string; description: React.ReactNode; phase?: string };

const sections: SettingsSection[] = [
  { icon: Palette, title: "Apariencia", description: "Modo oscuro activado. El tema claro se valorará más adelante." },
  { icon: Bell, title: "Notificaciones", description: "Recordatorios de tareas y eventos.", phase: "Fase 7" },
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

/** Configuración: apariencia, Google Calendar, notificaciones y cuenta. */
export function SettingsView({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="max-w-2xl space-y-3">
      {sections.map(({ icon: Icon, title, description, phase }, i) => (
        <div key={title} className="space-y-3">
          <section className="glass flex items-center gap-4 rounded-2xl p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {phase && <span className="text-xs text-muted-foreground">{phase}</span>}
          </section>
          {i === 0 && (
            <Suspense fallback={<div className="glass h-20 animate-pulse rounded-2xl" />}>
              <GoogleSection searchParams={searchParams} />
            </Suspense>
          )}
        </div>
      ))}
      <LogoutButton className="glass mt-2 w-auto rounded-2xl px-5 py-3 text-destructive hover:text-destructive" />
    </div>
  );
}
