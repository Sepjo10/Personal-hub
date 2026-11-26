import { Suspense } from "react";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import type { Metadata } from "next";
import { getSection } from "@/lib/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { FinanceView } from "@/features/finance/finance-view";

const section = getSection("/finanzas");

export const metadata: Metadata = { title: section.label };

export default function FinancesPage() {
  return (
    <>
      <PageHeader title={section.label} description={section.description} />
      <Suspense fallback={<ViewSkeleton />}>
        <FinanceView />
      </Suspense>
    </>
  );
}
