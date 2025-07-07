
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UnifiedDashboard } from "@/components/dashboard/UnifiedDashboard";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <UnifiedDashboard />
    </DashboardLayout>
  );
};

export default Dashboard;
