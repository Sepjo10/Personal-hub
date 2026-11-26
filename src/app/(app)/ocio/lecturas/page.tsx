import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { ReadingView } from "@/features/leisure/reading-view";

export const metadata: Metadata = { title: "Lecturas" };

export default function ReadingPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <ReadingView />
    </Suspense>
  );
}
