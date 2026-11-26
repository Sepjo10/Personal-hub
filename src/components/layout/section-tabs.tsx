"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavTab } from "@/lib/navigation";

/** Pestañas para secciones con subvistas (p. ej. Hoy / Semana / Mes). */
export function SectionTabs({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname();

  return (
    <div className="glass mb-6 inline-flex rounded-xl p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
