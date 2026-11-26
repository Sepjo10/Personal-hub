import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Semana" };

export default function WeekPage() {
  return <ComingSoon title="Semana" items={["Vista de 7 días", "Tareas y eventos", "Fechas límite", "Navegación entre semanas"]} />;
}
