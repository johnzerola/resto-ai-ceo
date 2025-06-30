
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OptimizedDashboard } from "@/components/dashboard/OptimizedDashboard";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <OptimizedDashboard />
    </DashboardLayout>
  );
};

export default Dashboard;
