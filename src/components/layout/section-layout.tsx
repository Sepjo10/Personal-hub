import { getSection } from "@/lib/navigation";
import { PageHeader } from "./page-header";
import { SectionTabs } from "./section-tabs";

/**
 * Estructura común de las secciones con pestañas: cabecera + pestañas + contenido.
 * Solo pasamos "tabs" (datos simples) al componente de cliente; el icono es una
 * función y no puede enviarse del servidor al cliente.
 */
export function SectionLayout({ href, children }: { href: string; children: React.ReactNode }) {
  const section = getSection(href);
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      {section.tabs && <SectionTabs tabs={section.tabs} />}
      {children}
    </>
  );
}
