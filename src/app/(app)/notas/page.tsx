import { Suspense } from "react";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import type { Metadata } from "next";
import { getSection } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { NotesView } from "@/features/notes/notes-view";

const section = getSection("/notas");

export const metadata: Metadata = { title: section.label };

export default function NotesPage() {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <Suspense fallback={<ViewSkeleton />}>
        <NotesView />
      </Suspense>
    </>
  );
}
