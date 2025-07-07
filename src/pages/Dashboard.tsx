
import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UnifiedDashboard } from "@/components/dashboard/UnifiedDashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <UnifiedDashboard />
      </Suspense>
    </DashboardLayout>
  );
};

export default Dashboard;
