"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isValidISODate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type CareerActionResult = { ok: boolean; error?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const STATUSES = ["pending", "sent", "interview", "accepted", "rejected"];
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function parseApplication(fd: FormData) {
  const company = str(fd, "company");
  const position = str(fd, "position");
  const status = str(fd, "status");
  const appliedOn = str(fd, "appliedOn");
  const url = str(fd, "url");
  // Varios campos con el mismo nombre "interviews": getAll los recoge todos
  const interviews = [...new Set(fd.getAll("interviews").map(String).filter(Boolean))];
  const nextStep = str(fd, "nextStep");
  const notes = str(fd, "notes");

  if (!company || !position) return { ok: false as const, error: "Empresa y puesto son obligatorios." };
  if (company.length > 120 || position.length > 150 || nextStep.length > 200) return { ok: false as const, error: "Algún campo es demasiado largo." };
  if (!STATUSES.includes(status)) return { ok: false as const, error: "Estado no válido." };
  if (appliedOn && !isValidISODate(appliedOn)) return { ok: false as const, error: "Fecha de solicitud no válida." };
  if (url && !/^https?:\/\//i.test(url)) return { ok: false as const, error: "El enlace debe empezar por http:// o https://" };
  if (interviews.length > 20 || interviews.some((d) => !isValidISODate(d))) return { ok: false as const, error: "Fechas de entrevista no válidas." };
  if (notes.length > 5000) return { ok: false as const, error: "Las notas son demasiado largas." };

  return {
    ok: true as const,
    values: {
      company,
      position,
      status,
      applied_on: appliedOn || null,
      url: url || null,
      interviews,
      next_step: nextStep || null,
      notes: notes || null,
    },
  };
}

export async function saveApplication(id: string | null, fd: FormData): Promise<CareerActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return { ok: false, error: "Candidatura no válida." };
  const parsed = parseApplication(fd);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("job_applications").update(parsed.values).eq("id", id)
    : await supabase.from("job_applications").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar la candidatura." };

  revalidatePath("/", "layout"); // las entrevistas también aparecen en el calendario
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<CareerActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Candidatura no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("job_applications").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar la candidatura." };

  revalidatePath("/", "layout");
  return { ok: true };
}
