import { Star } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { Pill } from "@/components/common/pill";
import { ProgressBar } from "@/components/common/progress-bar";
import { getToday } from "@/lib/today";
import { getMockBooks } from "@/data/mock/leisure";
import type { Book, BookStatus } from "@/types/leisure";

const statusLabel: Record<BookStatus, string> = { pending: "Pendiente", reading: "Leyendo", finished: "Terminado" };

const progressOf = (b: Book) => Math.round((b.currentPage / b.totalPages) * 100);

/** Lecturas: libro actual, resumen del año y biblioteca. */
export async function ReadingView() {
  const today = await getToday();
  const year = today.slice(0, 4);
  const books = getMockBooks(today);
  const current = books.find((b) => b.status === "reading");
  const finishedThisYear = books.filter((b) => b.status === "finished" && b.endDate?.startsWith(year));
  const pagesThisYear = finishedThisYear.reduce((sum, b) => sum + b.totalPages, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Leyendo ahora" className="lg:col-span-2">
        {current ? (
          <div>
            <p className="text-xl font-semibold">{current.title}</p>
            <p className="text-sm text-muted-foreground">{current.author}</p>
            <div className="mt-5 mb-1.5 flex justify-between text-sm">
              <span className="text-muted-foreground">
                Página {current.currentPage} de {current.totalPages}
              </span>
              <span className="font-medium text-primary">{progressOf(current)}%</span>
            </div>
            <ProgressBar value={progressOf(current)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No estás leyendo ningún libro.</p>
        )}
      </Panel>
      <Panel title={`Resumen ${year}`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-3xl font-semibold">{finishedThisYear.length}</p>
            <p className="text-xs text-muted-foreground">libros terminados</p>
          </div>
          <div>
            <p className="text-3xl font-semibold">{pagesThisYear}</p>
            <p className="text-xs text-muted-foreground">páginas leídas</p>
          </div>
        </div>
      </Panel>
      <Panel title="Biblioteca" className="lg:col-span-3">
        <ul className="divide-y divide-white/5">
          {books.map((b) => (
            <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">
                  {b.author}
                  {b.genre && ` · ${b.genre}`}
                </p>
              </div>
              {b.rating && (
                <span className="hidden items-center gap-0.5 text-amber-300 sm:flex">
                  {Array.from({ length: b.rating }, (_, i) => (
                    <Star key={i} className="size-3 fill-current" />
                  ))}
                </span>
              )}
              {b.status === "reading" && <span className="text-xs text-primary">{progressOf(b)}%</span>}
              <Pill className={b.status === "finished" ? "bg-emerald-400/15 text-emerald-300" : b.status === "reading" ? "bg-primary/15 text-primary" : "bg-white/10 text-muted-foreground"}>
                {statusLabel[b.status]}
              </Pill>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
