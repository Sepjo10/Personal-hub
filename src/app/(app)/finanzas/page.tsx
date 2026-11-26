import type { Metadata } from "next";
import { getSection } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

const section = getSection("/finanzas");

export const metadata: Metadata = { title: section.label };

export default function FinancesPage() {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <ComingSoon title={section.label} items={["Ingresos y gastos", "Categorías", "Saldo mensual", "Resumen del mes"]} />
    </>
  );
}
