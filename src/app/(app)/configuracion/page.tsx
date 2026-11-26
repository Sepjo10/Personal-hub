import type { Metadata } from "next";
import { getSection } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/features/settings/settings-view";

const section = getSection("/configuracion");

export const metadata: Metadata = { title: section.label };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <SettingsView />
    </>
  );
}
