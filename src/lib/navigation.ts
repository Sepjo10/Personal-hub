import {
  CalendarDays,
  GraduationCap,
  House,
  Settings,
  Sparkles,
  StickyNote,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Configuración central de la navegación.
 * El menú lateral, la barra móvil y las pestañas leen de aquí, así que para
 * añadir o renombrar una sección solo hay que tocar este archivo.
 */

export type NavTab = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  tabs?: NavTab[];
};

export const mainNav: NavItem[] = [
  {
    label: "Inicio",
    href: "/",
    icon: House,
    description: "Resumen de tu día.",
  },
  {
    label: "Planificador",
    href: "/planificador",
    icon: CalendarDays,
    description: "Tareas, agenda y calendario.",
    tabs: [
      { label: "Hoy", href: "/planificador/hoy" },
      { label: "Semana", href: "/planificador/semana" },
      { label: "Mes", href: "/planificador/mes" },
    ],
  },
  {
    label: "Académico",
    href: "/academico",
    icon: GraduationCap,
    description: "Universidad y carrera profesional.",
    tabs: [
      { label: "Universidad", href: "/academico/universidad" },
      { label: "Carrera", href: "/academico/carrera" },
    ],
  },
  {
    label: "Finanzas",
    href: "/finanzas",
    icon: Wallet,
    description: "Ingresos, gastos y saldo mensual.",
  },
  {
    label: "Ocio",
    href: "/ocio",
    icon: Sparkles,
    description: "Lecturas y actividades personales.",
    tabs: [
      { label: "Lecturas", href: "/ocio/lecturas" },
      { label: "Actividades", href: "/ocio/actividades" },
    ],
  },
  {
    label: "Notas",
    href: "/notas",
    icon: StickyNote,
    description: "Notas rápidas, recursos y enlaces.",
  },
];

export const settingsNav: NavItem = {
  label: "Configuración",
  href: "/configuracion",
  icon: Settings,
  description: "Preferencias, cuenta e integraciones.",
};

/** Busca una sección por su ruta base (p. ej. "/planificador"). */
export function getSection(href: string): NavItem {
  const item = [...mainNav, settingsNav].find((i) => i.href === href);
  if (!item) throw new Error(`Sección no encontrada: ${href}`);
  return item;
}

/** Indica si un enlace corresponde a la ruta actual (incluye subrutas). */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
