import type { NoteKind } from "@/types/note";

export const kindStyles: Record<NoteKind, { label: string; className: string }> = {
  quick: { label: "Rápida", className: "bg-white/10 text-muted-foreground" },
  important: { label: "Importante", className: "bg-rose-400/15 text-rose-300" },
  resource: { label: "Recurso", className: "bg-sky-400/15 text-sky-300" },
  link: { label: "Enlace", className: "bg-primary/15 text-primary" },
};
