export type BookStatus = "pending" | "reading" | "finished";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre?: string;
  status: BookStatus;
  currentPage: number;
  totalPages: number;
  startDate?: string;
  endDate?: string;
  rating?: number; // 1-5
  notes?: string;
};

export type ActivityType = "flight" | "trip" | "cinema" | "concert" | "medical" | "event";

export type Activity = {
  id: string;
  title: string;
  type: ActivityType;
  date?: string;
  time?: string;
  location?: string;
  price?: number;
  links?: string[];
  people?: string[];
  notes?: string;
};
