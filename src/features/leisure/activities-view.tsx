import { getToday } from "@/lib/today";
import { getActivities } from "./activities-data";
import { ActivitiesBoard } from "./activities-board";

/** Actividades (servidor): carga los datos y los pasa al tablero interactivo. */
export async function ActivitiesView() {
  const [today, activities] = await Promise.all([getToday(), getActivities()]);
  return <ActivitiesBoard activities={activities} today={today} />;
}
