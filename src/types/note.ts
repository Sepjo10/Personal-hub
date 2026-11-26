export type NoteKind = "quick" | "important" | "resource" | "link";

export type Note = {
  id: string;
  title: string;
  content: string;
  kind: NoteKind;
  url?: string;
  pinned: boolean;
  updatedAt: string; // fecha AAAA-MM-DD (hora de Madrid)
};
