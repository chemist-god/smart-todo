"use client";

import { useGoals } from '@/hooks/useData';

// Define types locally since Prisma client might not be generated yet
interface Goal {
    id: string;
    title: string;
    description: string | null;
    type: string;
    target: number;
    current: number;
    unit: string;
    startDate: Date;
    endDate: Date | null;
    isCompleted: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

interface Milestone {
    id: string;
    title: string;
    description: string | null;
    target: number;
    current: number;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    goalId: string;
}
import { FlagIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface GoalWithProgress extends Goal {
    progress: number;
    completedMilestones: number;
    totalMilestones: number;
    isOverdue: boolean;
    milestones: Milestone[];
}

export default function GoalsOverview() {
    // Use enhanced hook with real-time updates for active goals
    const { goals = [], isLoading: loading } = useGoals('active', 'all');

    const getGoalTypeColor = (type: string) => {
        switch (type) {
            case 'TASKS_COMPLETED': return 'bg-primary/20 text-primary border-primary/30';
            case 'POINTS_EARNED': return 'bg-success/20 text-success border-success/30';
            case 'STREAK_DAYS': return 'bg-warning/20 text-warning border-warning/30';
            case 'NOTES_CREATED': return 'bg-info/20 text-info border-info/30';
            case 'ACHIEVEMENTS_UNLOCKED': return 'bg-secondary/20 text-secondary border-secondary/30';
            case 'CUSTOM': return 'bg-muted/20 text-muted-foreground border-muted/30';
            default: return 'bg-muted/20 text-muted-foreground border-muted/30';
        }
    };

    const getGoalTypeLabel = (type: string) => {
        switch (type) {
            case 'TASKS_COMPLETED': return 'Tasks';
            case 'POINTS_EARNED': return 'Points';
            case 'STREAK_DAYS': return 'Streak';
            case 'NOTES_CREATED': return 'Notes';
            case 'ACHIEVEMENTS_UNLOCKED': return 'Achievements';
            case 'CUSTOM': return 'Custom';
            default: return 'Custom';
        }
    };

    const getStats = () => {
        const goalsArray = Array.isArray(goals) ? goals : [];
        const total = goalsArray.length;
        const completed = goalsArray.filter((g: any) => g.isCompleted).length;
        const overdue = goalsArray.filter((g: any) => g.isOverdue).length;
        const avgProgress = total > 0 ? goalsArray.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / total : 0;

        return { total, completed, overdue, avgProgress };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Goals Overview</h2>
                <Link
                    href="/goals"
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                    View All Goals →
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="backdrop-blur-sm bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-4 sm:p-5 rounded-2xl text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{stats.total}</div>
                    <div className="text-sm opacity-90">Active Goals</div>
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-success via-success/90 to-success/80 p-4 sm:p-5 rounded-2xl text-success-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{stats.completed}</div>
                    <div className="text-sm opacity-90">Completed</div>
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-info via-info/90 to-info/80 p-4 sm:p-5 rounded-2xl text-info-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{stats.avgProgress.toFixed(1)}%</div>
                    <div className="text-sm opacity-90">Avg Progress</div>
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-destructive via-destructive/90 to-destructive/80 p-4 sm:p-5 rounded-2xl text-destructive-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{stats.overdue}</div>
                    <div className="text-sm opacity-90">Overdue</div>
                </div>
            </div>

            {/* Goals List */}
            {stats.total === 0 ? (
                <div className="backdrop-blur-sm bg-card/50 p-6 sm:p-8 rounded-2xl border border-border/50 shadow-lg text-center">
                    <FlagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Active Goals</h3>
                    <p className="text-muted-foreground mb-4">
                        Create your first goal to start tracking your progress!
                    </p>
                    <Link
                        href="/goals"
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-lg"
                    >
                        <FlagIcon className="w-4 h-4 mr-2" />
                        Create Goal
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {(Array.isArray(goals) ? goals : []).slice(0, 5).map((goal: any) => (
                        <div
                            key={goal.id}
                            className="backdrop-blur-sm bg-card/50 p-4 sm:p-5 rounded-2xl border border-border/50 shadow-lg hover:shadow-xl hover:bg-card/60 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGoalTypeColor(goal.type)}`}>
                                            {getGoalTypeLabel(goal.type)}
                                        </span>
                                    </div>
                                    {goal.description && (
                                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                    {goal.isCompleted && (
                                        <CheckCircleIcon className="w-5 h-5 text-success" />
                                    )}
                                    {goal.isOverdue && !goal.isCompleted && (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-destructive" />
                                    )}
                                    {!goal.isCompleted && !goal.isOverdue && (
                                        <ClockIcon className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-muted-foreground">Progress</span>
                                    <span className="text-sm font-medium text-foreground tabular-nums">
                                        {goal.current} / {goal.target} {goal.unit}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            goal.isCompleted
                                                ? 'bg-success'
                                                : goal.isOverdue
                                                    ? 'bg-destructive'
                                                    : 'bg-primary'
                                        }`}
                                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-muted-foreground">{goal.progress.toFixed(1)}% complete</span>
                                    {goal.totalMilestones > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {goal.completedMilestones}/{goal.totalMilestones} milestones
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {goal.isCompleted ? 'Completed' :
                                        goal.isOverdue ? 'Overdue' :
                                            'In Progress'}
                                </span>
                                {goal.endDate && (
                                    <span>
                                        Due {new Date(goal.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {stats.total > 5 && (
                        <div className="text-center">
                            <Link
                                href="/goals"
                                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                            >
                                View {stats.total - 5} more goals →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
