// Goal-related types and interfaces
export type GoalType =
  | 'TASKS_COMPLETED'
  | 'POINTS_EARNED'
  | 'STREAK_DAYS'
  | 'NOTES_CREATED'
  | 'ACHIEVEMENTS_UNLOCKED'
  | 'CUSTOM';

export interface Milestone {
  id?: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  isCompleted: boolean;
  goalId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isCompleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalWithProgress extends Goal {
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
  isOverdue: boolean;
  milestones: Milestone[];
}

export interface CreateGoalData {
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  unit: string;
  startDate: string;
  endDate?: string;
  milestones?: Omit<Milestone, 'id' | 'current' | 'isCompleted' | 'goalId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  target?: number;
  unit?: string;
  endDate?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

export interface GoalFilter {
  status: 'all' | 'active' | 'completed';
  type: string;
}

export interface GoalProgressUpdate {
  current: number;
  milestoneId?: string;
}
