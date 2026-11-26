import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Carrera" };

export default function CareerPage() {
  return <ComingSoon title="Carrera" items={["Candidaturas", "Estado de cada proceso", "Entrevistas", "Próximos pasos"]} />;
}
