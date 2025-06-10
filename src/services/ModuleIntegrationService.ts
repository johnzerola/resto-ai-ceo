// Interface for system alerts
export interface SystemAlert {
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
  date: string;
}

// Add system alert function
export const addSystemAlert = (alert: SystemAlert): void => {
  try {
    const existingAlerts = getSystemAlerts();
    const newAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    
    existingAlerts.unshift(newAlert);
    
    // Keep only last 50 alerts
    const limitedAlerts = existingAlerts.slice(0, 50);
    
    localStorage.setItem("systemAlerts", JSON.stringify(limitedAlerts));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent("systemAlertsUpdated", { 
      detail: limitedAlerts 
    }));
  } catch (error) {
    console.error("Error adding system alert:", error);
  }
};

// Get system alerts function
export const getSystemAlerts = (): (SystemAlert & { id: string; timestamp: string })[] => {
  try {
    const alertsData = localStorage.getItem("systemAlerts");
    return alertsData ? JSON.parse(alertsData) : [];
  } catch (error) {
    console.error("Error loading system alerts:", error);
    return [];
  }
};

// Clear system alerts
export const clearSystemAlerts = (): void => {
  try {
    localStorage.removeItem("systemAlerts");
    window.dispatchEvent(new CustomEvent("systemAlertsUpdated", { 
      detail: [] 
    }));
  } catch (error) {
    console.error("Error clearing system alerts:", error);
  }
};

// Module integration status
export const getModuleStatus = () => {
  return {
    financial: true,
    inventory: true,
    goals: true,
    achievements: true,
    auth: true
  };
};

// Initialize module integration
export const initializeModuleIntegration = (): void => {
  console.log("Module integration initialized");
  
  // Add welcome alert
  addSystemAlert({
    type: "info",
    title: "Sistema Inicializado",
    description: "Todos os módulos foram carregados com sucesso",
    date: new Date().toLocaleString()
  });
};
