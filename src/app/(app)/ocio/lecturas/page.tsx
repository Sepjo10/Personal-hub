import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Lecturas" };

export default function ReadingPage() {
  return <ComingSoon title="Lecturas" items={["Libro actual y progreso", "Pendientes y terminados", "Valoraciones y notas", "Resumen anual"]} />;
}
