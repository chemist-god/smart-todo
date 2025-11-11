"use client";

import { useState } from 'react';
import { GoalWithProgress, GoalType } from '@/types/goals';
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
    const [progressInput, setProgressInput] = useState((goal.current ?? 0).toString());
    const [isUpdating, setIsUpdating] = useState(false);
    const { addToast } = useToast();

    const getGoalTypeVariant = (type: GoalType): "default" | "secondary" | "destructive" | "outline" => {
        switch (type) {
            case 'TASKS_COMPLETED': return 'default';
            case 'POINTS_EARNED': return 'secondary';
            case 'STREAK_DAYS': return 'outline';
            case 'NOTES_CREATED': return 'secondary';
            case 'ACHIEVEMENTS_UNLOCKED': return 'outline';
            case 'CUSTOM': return 'default';
            default: return 'default';
        }
    };

    const getGoalTypeLabel = (type: GoalType): string => {
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
        if (goal.isCompleted) return 'text-success';
        if (goal.isOverdue) return 'text-destructive';
        if (!goal.isActive) return 'text-muted-foreground';
        return 'text-primary';
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
            addToast({ type: 'error', title: 'Invalid progress value', message: 'Please enter a valid number' });
            return;
        }

        if (newProgress > goal.target) {
            addToast({ type: 'warning', title: 'Progress exceeds target', message: 'Progress cannot be higher than the target' });
            return;
        }

        try {
            setIsUpdating(true);
            await onUpdateProgress(goal.id, newProgress);
            addToast({ type: 'success', title: 'Progress updated', message: 'Your goal progress has been updated successfully' });
        } catch (error) {
            addToast({ type: 'error', title: 'Update failed', message: 'Failed to update progress. Please try again.' });
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
        <Card className={cn(
            "transition-all duration-200 hover:shadow-md",
            goal.isCompleted && "border-success/20 bg-success/5",
            goal.isOverdue && "border-destructive/20 bg-destructive/5",
            !goal.isActive && "border-muted bg-muted/20"
        )}>
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                            <Badge variant={getGoalTypeVariant(goal.type)}>
                                {getGoalTypeLabel(goal.type)}
                            </Badge>
                        </div>
                        {goal.description && (
                            <p className="text-muted-foreground text-sm">{goal.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleActive(goal.id, !goal.isActive)}
                            className={cn(
                                "p-2",
                                goal.isActive ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {goal.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(goal)}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(goal.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">Progress</span>
                        <span className={cn("text-sm font-medium", getStatusColor())}>
                            {(goal.current ?? 0)} / {goal.target} {goal.unit}
                        </span>
                    </div>
                    <Progress
                        value={goal.progress ?? 0}
                        className="w-full h-2"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">{(goal.progress ?? 0).toFixed(1)}% complete</span>
                        {goal.isCompleted && (
                            <span className="text-xs text-success font-medium">Completed!</span>
                        )}
                        {goal.isOverdue && !goal.isCompleted && (
                            <span className="text-xs text-destructive font-medium">Overdue</span>
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
                                className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                placeholder="Update progress"
                            />
                            <Button
                                onClick={handleProgressUpdate}
                                disabled={isUpdating}
                                size="sm"
                                className="px-4"
                            >
                                {isUpdating ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Status and Dates */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
                        <Button
                            variant="ghost"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-between w-full text-left text-sm font-medium text-foreground hover:text-primary"
                        >
                            <span>Milestones ({goal.completedMilestones}/{goal.totalMilestones})</span>
                            <span className={cn("transform transition-transform", isExpanded ? 'rotate-180' : '')}>
                                ▼
                            </span>
                        </Button>
                        {isExpanded && (
                            <div className="mt-3 space-y-2">
                                {goal.milestones.map((milestone) => (
                                    <div
                                        key={milestone.id}
                                        className={cn(
                                            "p-3 rounded-lg border",
                                            milestone.isCompleted
                                                ? 'border-success/20 bg-success/5'
                                                : 'border-border bg-muted/20'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-sm text-foreground">{milestone.title}</h4>
                                                {milestone.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-foreground">
                                                    {milestone.current} / {milestone.target}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {milestone.isCompleted ? 'Completed' : 'In Progress'}
                                                </div>
                                            </div>
                                        </div>
                                        <Progress
                                            value={(milestone.current / milestone.target) * 100}
                                            className="mt-2 w-full h-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
