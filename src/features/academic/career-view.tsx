import { getToday } from "@/lib/today";
import { getApplications } from "./career-data";
import { CareerBoard } from "./career-board";

/** Candidaturas (servidor): carga los datos y los pasa al tablero interactivo. */
export async function CareerView() {
  const today = await getToday();
  const applications = await getApplications();
  return <CareerBoard applications={applications} today={today} />;
}
