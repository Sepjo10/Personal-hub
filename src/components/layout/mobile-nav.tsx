"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActive, mainNav, settingsNav, type NavItem } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";

// En la barra inferior caben pocas secciones: las 3 primeras van fijas
// (Inicio, Planificador, Académico) y el resto se abre desde "Más".
const primaryItems = mainNav.slice(0, 3);
const moreItems = [...mainNav.slice(3), settingsNav];

/** Barra de navegación inferior para móvil (oculta desde "md"). */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some((i) => isActive(pathname, i.href));

  return (
    <>
      {/* Panel "Más" */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div className="glass absolute inset-x-3 bottom-20 rounded-2xl p-2 animate-in fade-in slide-in-from-bottom-4">
            {moreItems.map((item) => (
              <MoreLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
            <div className="mt-1 border-t border-white/5 pt-1">
              <LogoutButton className="rounded-xl py-3" />
            </div>
          </div>
        </div>
      )}

      <nav className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 py-1.5 md:hidden">
        <BarLink item={primaryItems[0]} active={isActive(pathname, primaryItems[0].href)} />
        <BarLink item={primaryItems[1]} active={isActive(pathname, primaryItems[1].href)} />

        {/* Acceso rápido para crear tareas (se conectará en la Fase 3) */}
        <button
          type="button"
          aria-label="Nueva tarea"
          className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          <Plus className="size-5" />
        </button>

        <BarLink item={primaryItems[2]} active={isActive(pathname, primaryItems[2].href)} />
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px]",
            moreActive || moreOpen ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Ellipsis className="size-5" />
          Más
        </button>
      </nav>
    </>
  );
}

function BarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px]",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  );
}

function MoreLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-white/5",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}
