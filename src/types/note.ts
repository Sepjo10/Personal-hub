export type NoteKind = "quick" | "important" | "resource" | "link";

export type Note = {
  id: string;
  title: string;
  content: string;
  kind: NoteKind;
  pinned?: boolean;
  updatedAt: string;
};
