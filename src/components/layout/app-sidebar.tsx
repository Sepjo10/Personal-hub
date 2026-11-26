"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive, mainNav, settingsNav, type NavItem } from "@/lib/navigation";

/**
 * Menú lateral de escritorio (visible desde el breakpoint "md").
 * Es un componente de cliente porque necesita usePathname() para saber
 * qué sección está activa y resaltarla.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/70 p-4 backdrop-blur-xl md:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2 pt-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          P
        </span>
        <span className="text-lg font-semibold tracking-tight">
          Personal <span className="text-primary">Hub</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {mainNav.map((item) => (
          <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <SidebarLink item={settingsNav} active={isActive(pathname, settingsNav.href)} />
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}
