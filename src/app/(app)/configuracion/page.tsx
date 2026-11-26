import type { Metadata } from "next";
import { getSection } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/features/settings/settings-view";
import type { SearchParams } from "@/features/planner/search-params";

const section = getSection("/configuracion");

export const metadata: Metadata = { title: section.label };

// searchParams (?google=conectado...) se pasa como promesa y se resuelve dentro de <Suspense>.
export default function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <SettingsView searchParams={searchParams} />
    </>
  );
}
