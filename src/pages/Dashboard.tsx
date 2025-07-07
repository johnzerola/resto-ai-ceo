
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { IntelligentDashboard } from "@/components/dashboard/IntelligentDashboard";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <IntelligentDashboard />
    </DashboardLayout>
  );
};

export default Dashboard;
