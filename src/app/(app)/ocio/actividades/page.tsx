import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Actividades" };

export default function ActivitiesPage() {
  return <ComingSoon title="Actividades" items={["Viajes y vuelos", "Cine y conciertos", "Citas médicas", "Ubicación, precio y enlaces"]} />;
}
