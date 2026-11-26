import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Activity, ActivityType } from "@/types/leisure";

type ActivityRow = {
  id: string;
  title: string;
  type: ActivityType;
  date: string | null;
  time: string | null;
  location: string | null;
  price: number | string | null;
  links: string[];
  people: string[];
  notes: string | null;
};

/** Todas mis actividades ordenadas por fecha (las que no tienen fecha, al final). */
export async function getActivities(): Promise<Activity[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select("id, title, type, date, time, location, price, links, people, notes")
    .order("date", { ascending: true, nullsFirst: false })
    .order("time", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`No se pudieron cargar las actividades: ${error.message}`);

  return (data as ActivityRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    date: r.date ?? undefined,
    time: r.time?.slice(0, 5) ?? undefined,
    location: r.location ?? undefined,
    price: r.price === null ? undefined : Number(r.price),
    links: r.links,
    people: r.people,
    notes: r.notes ?? undefined,
  }));
}
