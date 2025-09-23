"use client";

import { Goal, Milestone } from '@prisma/client';
import { useGoals } from '@/hooks/useData';
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
    const { goals, isLoading: loading } = useGoals('active', 'all');

    const getGoalTypeColor = (type: string) => {
        switch (type) {
            case 'TASKS_COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'POINTS_EARNED': return 'bg-green-100 text-green-800';
            case 'STREAK_DAYS': return 'bg-purple-100 text-purple-800';
            case 'NOTES_CREATED': return 'bg-yellow-100 text-yellow-800';
            case 'ACHIEVEMENTS_UNLOCKED': return 'bg-pink-100 text-pink-800';
            case 'CUSTOM': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
        const total = goals.length;
        const completed = goals.filter(g => g.isCompleted).length;
        const overdue = goals.filter(g => g.isOverdue).length;
        const avgProgress = total > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / total : 0;

        return { total, completed, overdue, avgProgress };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Goals Overview</h2>
                <Link
                    href="/goals"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View All Goals →
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm opacity-90">Active Goals</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                    <div className="text-2xl font-bold">{stats.completed}</div>
                    <div className="text-sm opacity-90">Completed</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                    <div className="text-2xl font-bold">{stats.avgProgress.toFixed(1)}%</div>
                    <div className="text-sm opacity-90">Avg Progress</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
                    <div className="text-2xl font-bold">{stats.overdue}</div>
                    <div className="text-sm opacity-90">Overdue</div>
                </div>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                    <FlagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Goals</h3>
                    <p className="text-gray-500 mb-4">
                        Create your first goal to start tracking your progress!
                    </p>
                    <Link
                        href="/goals"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FlagIcon className="w-4 h-4 mr-2" />
                        Create Goal
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.slice(0, 5).map((goal) => (
                        <div
                            key={goal.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalTypeColor(goal.type)}`}>
                                            {getGoalTypeLabel(goal.type)}
                                        </span>
                                    </div>
                                    {goal.description && (
                                        <p className="text-sm text-gray-600">{goal.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {goal.isCompleted && (
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    )}
                                    {goal.isOverdue && !goal.isCompleted && (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                    )}
                                    {!goal.isCompleted && !goal.isOverdue && (
                                        <ClockIcon className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Progress</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {goal.current} / {goal.target} {goal.unit}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${goal.isCompleted ? 'bg-green-500' :
                                            goal.isOverdue ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500">{goal.progress.toFixed(1)}% complete</span>
                                    {goal.totalMilestones > 0 && (
                                        <span className="text-xs text-gray-500">
                                            {goal.completedMilestones}/{goal.totalMilestones} milestones
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
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

                    {goals.length > 5 && (
                        <div className="text-center">
                            <Link
                                href="/goals"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View {goals.length - 5} more goals →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
