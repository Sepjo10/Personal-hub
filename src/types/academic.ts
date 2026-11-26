export type Subject = {
  id: string;
  name: string;
  code: string;
  professor?: string;
  progress: number; // 0-100
};

export type ClassSession = {
  id: string;
  subjectId: string;
  weekday: number; // 0 = lunes
  start: string;
  end: string;
  room?: string;
};

export type AcademicDate = {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  kind: "exam" | "deadline";
};

export type ApplicationStatus = "pending" | "sent" | "interview" | "accepted" | "rejected";

export type JobApplication = {
  id: string;
  company: string;
  position: string;
  appliedOn?: string;
  status: ApplicationStatus;
  interviews: string[]; // fechas ISO
  nextStep?: string;
  notes?: string;
};
