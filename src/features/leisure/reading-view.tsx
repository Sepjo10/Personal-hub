import { getToday } from "@/lib/today";
import { getBooks } from "./books-data";
import { ReadingBoard } from "./reading-board";

/** Lecturas (servidor): carga los libros y calcula el resumen del año. */
export async function ReadingView() {
  const [today, books] = await Promise.all([getToday(), getBooks()]);
  const year = today.slice(0, 4);
  const finishedThisYear = books.filter((b) => b.status === "finished" && b.endDate?.startsWith(year));

  return (
    <ReadingBoard
      books={books}
      year={year}
      summary={{
        finished: finishedThisYear.length,
        pages: finishedThisYear.reduce((sum, b) => sum + b.totalPages, 0),
      }}
    />
  );
}
