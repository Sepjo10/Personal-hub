import type { Metadata } from "next";
import { getSection } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

const section = getSection("/configuracion");

export const metadata: Metadata = { title: section.label };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <ComingSoon title={section.label} items={["Preferencias y apariencia", "Notificaciones", "Google Calendar", "Cuenta y cierre de sesión"]} />
    </>
  );
}
