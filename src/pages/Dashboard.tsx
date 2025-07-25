
import React from "react";
import { OptimizedDirectDashboard } from "@/components/dashboard/OptimizedDirectDashboard";
import { TrialBlocker } from "@/components/trial/TrialBlocker";

const Dashboard = () => {
  return (
    <TrialBlocker 
      featureName="Dashboard Completo" 
      description="Visualize todas as métricas e dados financeiros do seu restaurante"
    >
      <OptimizedDirectDashboard />
    </TrialBlocker>
  );
};

export default Dashboard;
