export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}
