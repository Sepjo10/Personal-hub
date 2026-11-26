import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { UniversityView } from "@/features/academic/university-view";

export const metadata: Metadata = { title: "Universidad" };

export default function UniversityPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <UniversityView />
    </Suspense>
  );
}
