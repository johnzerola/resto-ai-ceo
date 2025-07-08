
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FastDashboard } from "@/components/dashboard/FastDashboard";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <FastDashboard />
    </DashboardLayout>
  );
};

export default Dashboard;
