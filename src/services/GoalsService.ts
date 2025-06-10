
export type GoalCategory = "financial" | "inventory" | "sales" | "operational" | "customer";

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: GoalCategory;
  deadline?: string;
  reward?: string;
  completed: boolean;
  linkedTo?: {
    source: "dre" | "cmv" | "cashFlow";
    metric: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  dateUnlocked?: string;
  requiredGoals?: number;
}

// Goals management functions
export const getAllGoals = (): Goal[] => {
  try {
    const goalsData = localStorage.getItem("goals");
    return goalsData ? JSON.parse(goalsData) : [];
  } catch (error) {
    console.error("Error loading goals:", error);
    return [];
  }
};

export const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): void => {
  try {
    const goals = getAllGoals();
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    goals.push(newGoal);
    localStorage.setItem("goals", JSON.stringify(goals));
    
    // Dispatch event for updates
    window.dispatchEvent(new CustomEvent("goalsUpdated"));
  } catch (error) {
    console.error("Error adding goal:", error);
  }
};

export const updateGoalProgress = (goalId: string, newProgress: number): void => {
  try {
    const goals = getAllGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex !== -1) {
      goals[goalIndex].current = newProgress;
      goals[goalIndex].completed = newProgress >= goals[goalIndex].target;
      goals[goalIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem("goals", JSON.stringify(goals));
      window.dispatchEvent(new CustomEvent("goalsUpdated"));
      
      // Check for achievements
      checkAchievements();
    }
  } catch (error) {
    console.error("Error updating goal progress:", error);
  }
};

export const removeGoal = (goalId: string): boolean => {
  try {
    const goals = getAllGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    
    localStorage.setItem("goals", JSON.stringify(filteredGoals));
    window.dispatchEvent(new CustomEvent("goalsUpdated"));
    
    return true;
  } catch (error) {
    console.error("Error removing goal:", error);
    return false;
  }
};

// Achievements management functions
export const getAllAchievements = (): Achievement[] => {
  try {
    const achievementsData = localStorage.getItem("achievements");
    return achievementsData ? JSON.parse(achievementsData) : getDefaultAchievements();
  } catch (error) {
    console.error("Error loading achievements:", error);
    return getDefaultAchievements();
  }
};

const getDefaultAchievements = (): Achievement[] => {
  return [
    {
      id: "first-goal",
      name: "Primeira Meta",
      description: "Crie sua primeira meta",
      icon: "🎯",
      category: "operational",
      isUnlocked: false
    },
    {
      id: "goal-completed",
      name: "Meta Alcançada",
      description: "Complete sua primeira meta",
      icon: "✅",
      category: "operational",
      isUnlocked: false
    },
    {
      id: "financial-goal",
      name: "Foco Financeiro",
      description: "Crie uma meta financeira",
      icon: "💰",
      category: "financial",
      isUnlocked: false
    }
  ];
};

const checkAchievements = (): void => {
  const goals = getAllGoals();
  const achievements = getAllAchievements();
  let achievementsUpdated = false;

  // Check for "first goal" achievement
  const firstGoalAchievement = achievements.find(a => a.id === "first-goal");
  if (firstGoalAchievement && !firstGoalAchievement.isUnlocked && goals.length > 0) {
    firstGoalAchievement.isUnlocked = true;
    firstGoalAchievement.dateUnlocked = new Date().toISOString();
    achievementsUpdated = true;
  }

  // Check for "goal completed" achievement
  const completedGoalAchievement = achievements.find(a => a.id === "goal-completed");
  if (completedGoalAchievement && !completedGoalAchievement.isUnlocked && goals.some(g => g.completed)) {
    completedGoalAchievement.isUnlocked = true;
    completedGoalAchievement.dateUnlocked = new Date().toISOString();
    achievementsUpdated = true;
  }

  // Check for "financial goal" achievement
  const financialGoalAchievement = achievements.find(a => a.id === "financial-goal");
  if (financialGoalAchievement && !financialGoalAchievement.isUnlocked && goals.some(g => g.category === "financial")) {
    financialGoalAchievement.isUnlocked = true;
    financialGoalAchievement.dateUnlocked = new Date().toISOString();
    achievementsUpdated = true;
  }

  if (achievementsUpdated) {
    localStorage.setItem("achievements", JSON.stringify(achievements));
    window.dispatchEvent(new CustomEvent("achievementsUpdated"));
  }
};

// Initialize default goals if none exist
export const initializeDefaultGoals = (): void => {
  const existingGoals = getAllGoals();
  if (existingGoals.length === 0) {
    // Initialize with some default goals
    const defaultGoals = [
      {
        title: "Reduzir CMV",
        description: "Reduzir o Custo da Mercadoria Vendida para melhorar a margem de lucro",
        target: 30,
        current: 0,
        unit: "%",
        category: "financial" as GoalCategory,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        reward: "Bônus de 10% para equipe"
      }
    ];

    defaultGoals.forEach(goal => addGoal(goal));
  }
};

// Sync goals with financial data
export const syncGoalsWithFinancialData = (): void => {
  // This function would sync goals with actual financial data
  // For now, it's a placeholder for future implementation
  console.log("Syncing goals with financial data...");
};

// Setup listener for financial data updates
export const setupFinancialDataListener = (): void => {
  const handleFinancialDataUpdate = () => {
    syncGoalsWithFinancialData();
  };

  window.addEventListener("financialDataUpdated", handleFinancialDataUpdate);
};
