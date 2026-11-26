import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function HomePage() {
  return (
    <>
      <PageHeader title="Inicio" description="Resumen de tu día." />
      <ComingSoon
        title="Dashboard"
        items={["Fecha actual", "Resumen de tareas", "3 prioridades del día", "Agenda", "Próximos eventos", "Objetivos diarios"]}
      />
    </>
  );
}
