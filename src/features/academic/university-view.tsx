import { getToday } from "@/lib/today";
import { getUniversityData } from "./university-data";
import { UniversityBoard } from "./university-board";

/** Universidad (servidor): carga asignaturas, horario y fechas. */
export async function UniversityView() {
  const today = await getToday();
  const { subjects, sessions, dates } = await getUniversityData();
  return <UniversityBoard subjects={subjects} sessions={sessions} dates={dates} today={today} />;
}
