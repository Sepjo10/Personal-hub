import { Bell, CalendarDays, LogOut, Palette, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type SettingsSection = { icon: LucideIcon; title: string; description: string; phase?: string; action?: string };

const sections: SettingsSection[] = [
  { icon: Palette, title: "Apariencia", description: "Modo oscuro activado. El tema claro se valorará más adelante." },
  { icon: Bell, title: "Notificaciones", description: "Recordatorios de tareas y eventos.", phase: "Fase 7" },
  { icon: CalendarDays, title: "Google Calendar", description: "Muestra tus eventos de Google en el planificador.", phase: "Fase 6", action: "Conectar" },
  { icon: UserRound, title: "Cuenta", description: "Información de tu cuenta e inicio de sesión.", phase: "Fase 5" },
];

/** Configuración: de momento solo muestra las opciones previstas. */
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
      <Button variant="destructive" disabled className="mt-2">
        <LogOut />
        Cerrar sesión
      </Button>
    </div>
  );
}
