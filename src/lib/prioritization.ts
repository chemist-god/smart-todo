import { Todo } from '@prisma/client';

interface TaskWithImpact extends Todo {
  impactScore: number;
  effortScore: number;
  priorityScore: number;
}

/**
 * Implements the 80/20 rule (Pareto Principle) for task prioritization
 * Identifies the top 20% of tasks that will yield 80% of the results
 */
export function applyParetoPrinciple(tasks: Todo[]): Todo[] {
  if (tasks.length === 0) return [];

  // Calculate impact score for each task
  const tasksWithScores = tasks.map(task => {
    // Impact score based on priority and points
    const priorityMultiplier = {
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    }[task.priority] || 1;

    // Effort score (inverse of points, since higher points might indicate more effort)
    const effortScore = Math.min(10, Math.max(1, Math.ceil(task.points / 10)));
    
    // Calculate impact score (higher is better)
    const impactScore = (priorityMultiplier * task.points) / effortScore;

    return {
      ...task,
      impactScore,
      effortScore,
      priorityScore: impactScore / effortScore // Tasks with highest impact per effort
    };
  });

  // Sort by priority score (descending)
  const sortedTasks = [...tasksWithScores].sort((a, b) => b.priorityScore - a.priorityScore);

  // Get top 20% highest impact tasks
  const top20PercentCount = Math.ceil(sortedTasks.length * 0.2);
  const topTasks = sortedTasks.slice(0, top20PercentCount);

  return topTasks;
}

/**
 * Implements the Eisenhower Matrix for task prioritization
 */
export function applyEisenhowerMatrix(tasks: Todo[]): {
  importantUrgent: Todo[];
  importantNotUrgent: Todo[];
  notImportantUrgent: Todo[];
  notImportantNotUrgent: Todo[];
} {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  return tasks.reduce((acc, task) => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isUrgent = dueDate 
      ? (dueDate.getTime() - now.getTime()) <= (3 * oneDay) // Due in 3 days or less
      : false;
    
    const isImportant = task.priority === 'HIGH' || task.priority === 'MEDIUM';

    if (isImportant && isUrgent) {
      acc.importantUrgent.push(task);
    } else if (isImportant && !isUrgent) {
      acc.importantNotUrgent.push(task);
    } else if (!isImportant && isUrgent) {
      acc.notImportantUrgent.push(task);
    } else {
      acc.notImportantNotUrgent.push(task);
    }

    return acc;
  }, {
    importantUrgent: [] as Todo[],
    importantNotUrgent: [] as Todo[],
    notImportantUrgent: [] as Todo[],
    notImportantNotUrgent: [] as Todo[]
  });
}

/**
 * Calculates task priority based on multiple factors
 */
export function calculateTaskPriority(task: Todo): number {
  // Base priority from task priority
  const priorityScore = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  }[task.priority] || 1;

  // Time sensitivity (due date proximity)
  let timeScore = 0;
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 1) timeScore = 10;
    else if (daysUntilDue <= 3) timeScore = 7;
    else if (daysUntilDue <= 7) timeScore = 5;
    else if (daysUntilDue <= 14) timeScore = 3;
    else timeScore = 1;
  }

  // Points (potential reward/impact)
  const pointsScore = Math.min(10, Math.max(1, Math.ceil(task.points / 10)));

  // Weighted average of factors
  return (priorityScore * 0.4) + (timeScore * 0.4) + (pointsScore * 0.2);
}

/**
 * Gets the recommended focus tasks using multiple prioritization methods
 */
export function getRecommendedFocusTasks(tasks: Todo[]): Todo[] {
  if (tasks.length === 0) return [];
  
  // Get top 20% tasks using Pareto
  const paretoTasks = applyParetoPrinciple(tasks);
  
  // Get important & urgent tasks from Eisenhower
  const { importantUrgent } = applyEisenhowerMatrix(tasks);
  
  // Combine and deduplicate
  const combined = [...new Set([...paretoTasks, ...importantUrgent])];
  
  // Sort by calculated priority
  return combined.sort((a, b) => 
    calculateTaskPriority(b) - calculateTaskPriority(a)
  );
}
