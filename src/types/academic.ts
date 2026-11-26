export type Subject = {
  id: string;
  name: string;
  code?: string;
  professor?: string;
  progress: number; // 0-100
  periodStart?: string;
  periodEnd?: string;
  active: boolean;
};

export type ClassSession = {
  id: string;
  subjectId: string;
  weekday: number; // 0 = lunes
  start: string; // "HH:MM"
  end: string;
  room?: string;
};

export type AcademicDate = {
  id: string;
  subjectId?: string;
  title: string;
  kind: "exam" | "deadline";
  date: string;
  time?: string;
  done: boolean;
};

export type ApplicationStatus = "pending" | "sent" | "interview" | "accepted" | "rejected";

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedOn?: string;
  url?: string;
  interviews: string[]; // fechas ISO
  nextStep?: string;
  notes?: string;
};
