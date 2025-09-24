"use client";

import { useState } from 'react';
import { Goal, Milestone } from '@prisma/client';
import {
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    PauseIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, isBefore } from 'date-fns';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toast';

interface GoalWithProgress extends Goal {
    progress: number;
    completedMilestones: number;
    totalMilestones: number;
    isOverdue: boolean;
    milestones: Milestone[];
}

interface GoalCardProps {
    goal: GoalWithProgress;
    onEdit: (goal: GoalWithProgress) => void;
    onDelete: (goalId: string) => void;
    onToggleActive: (goalId: string, isActive: boolean) => void;
    onUpdateProgress: (goalId: string, current: number) => void;
}

export default function GoalCard({
    goal,
    onEdit,
    onDelete,
    onToggleActive,
    onUpdateProgress
}: GoalCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [progressInput, setProgressInput] = useState(goal.current.toString());
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

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
            case 'TASKS_COMPLETED': return 'Tasks Completed';
            case 'POINTS_EARNED': return 'Points Earned';
            case 'STREAK_DAYS': return 'Streak Days';
            case 'NOTES_CREATED': return 'Notes Created';
            case 'ACHIEVEMENTS_UNLOCKED': return 'Achievements Unlocked';
            case 'CUSTOM': return 'Custom';
            default: return 'Custom';
        }
    };

    const getStatusColor = () => {
        if (goal.isCompleted) return 'text-green-600';
        if (goal.isOverdue) return 'text-red-600';
        if (!goal.isActive) return 'text-gray-500';
        return 'text-blue-600';
    };

    const getStatusIcon = () => {
        if (goal.isCompleted) return <CheckCircleIcon className="w-5 h-5" />;
        if (goal.isOverdue) return <ExclamationTriangleIcon className="w-5 h-5" />;
        if (!goal.isActive) return <PauseIcon className="w-5 h-5" />;
        return <PlayIcon className="w-5 h-5" />;
    };

    const handleProgressUpdate = async () => {
        const newProgress = parseInt(progressInput);
        if (isNaN(newProgress) || newProgress < 0) {
            toast.error('Invalid progress value', 'Please enter a valid number');
            return;
        }

        if (newProgress > goal.target) {
            toast.warning('Progress exceeds target', 'Progress cannot be higher than the target');
            return;
        }

        try {
            setIsUpdating(true);
            await onUpdateProgress(goal.id, newProgress);
            toast.success('Progress updated', 'Your goal progress has been updated successfully');
        } catch (error) {
            toast.error('Update failed', 'Failed to update progress. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (date: Date | string) => {
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const getDaysRemaining = () => {
        if (!goal.endDate) return null;
        const now = new Date();
        const endDate = new Date(goal.endDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <div className={`bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${goal.isCompleted ? 'border-green-200 bg-green-50' :
            goal.isOverdue ? 'border-red-200 bg-red-50' :
                !goal.isActive ? 'border-gray-200 bg-gray-50' :
                    'border-gray-200'
            }`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalTypeColor(goal.type)}`}>
                                {getGoalTypeLabel(goal.type)}
                            </span>
                        </div>
                        {goal.description && (
                            <p className="text-gray-600 text-sm">{goal.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onToggleActive(goal.id, !goal.isActive)}
                            className={`p-2 rounded-lg transition-colors ${goal.isActive
                                ? 'text-blue-600 hover:bg-blue-100'
                                : 'text-gray-400 hover:bg-gray-100'
                                }`}
                        >
                            {goal.isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => onEdit(goal)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(goal.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className={`text-sm font-medium ${getStatusColor()}`}>
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
                        {goal.isCompleted && (
                            <span className="text-xs text-green-600 font-medium">Completed!</span>
                        )}
                        {goal.isOverdue && !goal.isCompleted && (
                            <span className="text-xs text-red-600 font-medium">Overdue</span>
                        )}
                    </div>
                </div>

                {/* Progress Input */}
                {!goal.isCompleted && goal.isActive && (
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={progressInput}
                                onChange={(e) => setProgressInput(e.target.value)}
                                min="0"
                                max={goal.target}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Update progress"
                            />
                            <button
                                onClick={handleProgressUpdate}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Status and Dates */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            {getStatusIcon()}
                            <span className={getStatusColor()}>
                                {goal.isCompleted ? 'Completed' :
                                    goal.isOverdue ? 'Overdue' :
                                        !goal.isActive ? 'Paused' : 'Active'}
                            </span>
                        </div>
                        {goal.totalMilestones > 0 && (
                            <div className="flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>{goal.completedMilestones}/{goal.totalMilestones} milestones</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Started {formatDate(goal.startDate)}</span>
                        </div>
                        {goal.endDate && (
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>
                                    {daysRemaining !== null && daysRemaining < 0
                                        ? `Overdue by ${Math.abs(daysRemaining)} days`
                                        : `Due ${formatDate(goal.endDate)}`
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                    <div className="border-t pt-4">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            <span>Milestones ({goal.completedMilestones}/{goal.totalMilestones})</span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {isExpanded && (
                            <div className="mt-3 space-y-2">
                                {goal.milestones.map((milestone) => (
                                    <div
                                        key={milestone.id}
                                        className={`p-3 rounded-lg border ${milestone.isCompleted
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-sm">{milestone.title}</h4>
                                                {milestone.description && (
                                                    <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {milestone.current} / {milestone.target}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {milestone.isCompleted ? 'Completed' : 'In Progress'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                                            <div
                                                className={`h-1 rounded-full ${milestone.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}
                                                style={{
                                                    width: `${Math.min((milestone.current / milestone.target) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
