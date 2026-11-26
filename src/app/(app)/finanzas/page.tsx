import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { getSection } from "@/lib/navigation";
import { FinanceView } from "@/features/finance/finance-view";
import type { SearchParams } from "@/features/planner/search-params";

const section = getSection("/finanzas");

export const metadata: Metadata = { title: section.label };

export default function FinancesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <Suspense fallback={<ViewSkeleton />}>
        <FinanceView searchParams={searchParams} />
      </Suspense>
    </>
  );
}
