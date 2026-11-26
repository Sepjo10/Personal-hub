import { Suspense } from "react";
import { Dashboard, DashboardSkeleton } from "@/features/dashboard/dashboard";

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
