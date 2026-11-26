import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Mes" };

export default function MonthPage() {
  return <ComingSoon title="Mes" items={["Calendario mensual", "Exámenes y entregas", "Eventos y tareas", "Navegación entre meses"]} />;
}
