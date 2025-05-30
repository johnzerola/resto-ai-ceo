
export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
  reward: string | null;
  category: GoalCategory;
  createdAt: string;
  updatedAt: string;
  linkedTo: LinkedData | null;
}

export type GoalCategory = "financial" | "operational" | "quality" | "customer";

export interface LinkedData {
  source: "dre" | "cmv" | "cash_flow" | "inventory";
  metric: string;
}

export interface GoalProgressCardProps {
  goal: Goal;
  onDelete: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
}
