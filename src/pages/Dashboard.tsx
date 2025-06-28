
import React from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { OptimizedDashboard } from "@/components/dashboard/OptimizedDashboard";

const Dashboard = () => {
  console.log('Dashboard component loading...');
  
  return (
    <ModernLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <OptimizedDashboard />
      </div>
    </ModernLayout>
  );
};

export default Dashboard;
