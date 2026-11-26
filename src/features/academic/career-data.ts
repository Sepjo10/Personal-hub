import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, JobApplication } from "@/types/academic";

export type ApplicationRow = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  applied_on: string | null;
  url: string | null;
  interviews: string[];
  next_step: string | null;
  notes: string | null;
};

export const APPLICATION_COLUMNS = "id, company, position, status, applied_on, url, interviews, next_step, notes";

export const toApplication = (r: ApplicationRow): JobApplication => ({
  id: r.id,
  company: r.company,
  position: r.position,
  status: r.status,
  appliedOn: r.applied_on ?? undefined,
  url: r.url ?? undefined,
  interviews: [...r.interviews].sort(),
  nextStep: r.next_step ?? undefined,
  notes: r.notes ?? undefined,
});

/** Todas mis candidaturas, las modificadas más recientemente primero. */
export async function getApplications(): Promise<JobApplication[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_applications")
    .select(APPLICATION_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar las candidaturas: ${error.message}`);
  return (data as ApplicationRow[]).map(toApplication);
}
