
import React from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { OptimizedDashboard } from "@/components/dashboard/OptimizedDashboard";

const Dashboard = () => {
  console.log('Dashboard component loading...');
  
  return (
    <div className="min-h-screen bg-background">
      <ModernLayout>
        <div className="p-6">
          <OptimizedDashboard />
        </div>
      </ModernLayout>
    </div>
  );
};

export default Dashboard;
