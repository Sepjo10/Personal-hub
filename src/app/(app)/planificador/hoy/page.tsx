import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Hoy" };

export default function TodayPage() {
  return <ComingSoon title="Hoy" items={["Tareas pendientes y completadas", "Prioridades", "Agenda cronológica", "Planificar mañana"]} />;
}
