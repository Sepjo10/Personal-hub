import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Universidad" };

export default function UniversityPage() {
  return <ComingSoon title="Universidad" items={["Asignaturas", "Horario de clases", "Exámenes y entregas", "Progreso por asignatura"]} />;
}
