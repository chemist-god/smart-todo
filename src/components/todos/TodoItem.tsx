"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    PencilIcon,
    TrashIcon,
    ChevronDownIcon,
    ClockIcon,
    StarIcon,
    PlayIcon,
    PauseIcon,
    StopIcon
} from "@heroicons/react/24/outline";
import TodoTimer from "./TodoTimer";
import PomodoroTimer from "./PomodoroTimer";

interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    points: number;
    createdAt: string;
    completedAt?: string;
    // Enhanced timer fields
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    timeZone?: string;
    timerStatus?: "STOPPED" | "RUNNING" | "PAUSED" | "COMPLETED";
    timerStartTime?: string;
    totalTimeSpent?: number;
    focusMode?: boolean;
    isRecurring?: boolean;
    recurrencePattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
    pomodoroSessions?: number;
    breakDuration?: number;
}

interface TodoItemProps {
    todo: Todo;
    onUpdate: (todoId: string, updates: Partial<Todo>) => Promise<void>;
    onDelete: (todoId: string) => Promise<void>;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [showPomodoro, setShowPomodoro] = useState(false);
    const [currentTimeSpent, setCurrentTimeSpent] = useState(todo.totalTimeSpent || 0);

    const priorityColors = {
        LOW: "bg-green-100 text-green-800 border-green-200",
        MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
        HIGH: "bg-red-100 text-red-800 border-red-200",
    };

    const priorityLabels = {
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
    };

    const priorityIcons = {
        LOW: "🟢",
        MEDIUM: "🟡",
        HIGH: "🔴",
    };

    const isOverdue = todo.dueDate && new Date() > new Date(todo.dueDate) && !todo.completed;

    const handleToggleComplete = async () => {
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            await onUpdate(todo.id, { completed: !todo.completed });
        } catch (error) {
            console.error('Failed to toggle todo:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (isUpdating) return;

        if (confirm('Are you sure you want to delete this todo?')) {
            setIsUpdating(true);
            try {
                await onDelete(todo.id);
            } catch (error) {
                console.error('Failed to delete todo:', error);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    const handleTimeUpdate = async (timeSpent: number) => {
        setCurrentTimeSpent(timeSpent);
        try {
            await onUpdate(todo.id, { totalTimeSpent: timeSpent });
        } catch (error) {
            console.error('Failed to update time spent:', error);
        }
    };

    const handleSessionComplete = async (sessionData: any) => {
        try {
            // Update pomodoro sessions count if it's a focus session
            if (sessionData.sessionType === 'FOCUS' || sessionData.sessionType === 'DEEP_WORK') {
                await onUpdate(todo.id, {
                    pomodoroSessions: (todo.pomodoroSessions || 0) + 1
                });
            }
        } catch (error) {
            console.error('Failed to update session data:', error);
        }
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className={`bg-card border border-border rounded-xl p-4 hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 group ${
            todo.completed
                ? 'border-green-200/50 bg-green-50/30 dark:border-green-800/30 dark:bg-green-950/20'
                : isOverdue
                    ? 'border-red-200/50 bg-red-50/30 dark:border-red-800/30 dark:bg-red-950/20'
                    : 'hover:border-primary/20'
        }`}>
            <div className="flex items-start gap-3">
                {/* Enhanced Checkbox */}
                <div className="flex-shrink-0 mt-0.5">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={handleToggleComplete}
                        disabled={isUpdating}
                        className="h-5 w-5 text-primary bg-background border-2 border-border rounded-md focus:ring-primary/20 focus:ring-2 focus:ring-offset-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-semibold leading-tight transition-all duration-200 ${
                                todo.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground group-hover:text-primary"
                            }`}>
                                {todo.title}
                            </h3>
                            {todo.description && (
                                <p className={`text-sm mt-1.5 leading-relaxed transition-colors duration-200 ${
                                    todo.completed
                                        ? "text-muted-foreground/70"
                                        : "text-muted-foreground"
                                }`}>
                                    {todo.description}
                                </p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Priority Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                                todo.priority === 'HIGH'
                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/30'
                                    : todo.priority === 'MEDIUM'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800/30'
                                        : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/30'
                            }`}>
                                <span className="text-xs">
                                    {todo.priority === 'HIGH' ? '🔴' : todo.priority === 'MEDIUM' ? '🟡' : '🟢'}
                                </span>
                                {priorityLabels[todo.priority]}
                            </span>

                            {/* Points Badge */}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                <StarIcon className="w-3 h-3" />
                                {todo.points}
                            </span>

                            {/* Time Spent Badge */}
                            {currentTimeSpent > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/30">
                                    <ClockIcon className="w-3 h-3" />
                                    {formatDuration(currentTimeSpent)}
                                </span>
                            )}

                            {/* Pomodoro Sessions Badge */}
                            {todo.pomodoroSessions && todo.pomodoroSessions > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/30">
                                    🍅 {todo.pomodoroSessions}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {todo.dueDate && (
                            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                                <ClockIcon className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                    {isOverdue ? 'Overdue' : 'Due'}: {format(new Date(todo.dueDate), "MMM d, yyyy")}
                                </span>
                            </div>
                        )}
                        <span className="font-medium">Created {format(new Date(todo.createdAt), "MMM d")}</span>
                        {todo.completedAt && (
                            <span className="font-medium">Completed {format(new Date(todo.completedAt), "MMM d")}</span>
                        )}
                    </div>
                </div>

                {/* Enhanced Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Timer Controls */}
                    {!todo.completed && (
                        <>
                            <button
                                onClick={() => setShowTimer(!showTimer)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 focus-enhanced"
                                title="Timer"
                            >
                                <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowPomodoro(!showPomodoro)}
                                className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-all duration-200 focus-enhanced"
                                title="Pomodoro"
                            >
                                🍅
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 focus-enhanced"
                        title="Expand"
                    >
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-enhanced"
                        title="Delete"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Enhanced Timer Components */}
            {showTimer && !todo.completed && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <TodoTimer
                        todoId={todo.id}
                        initialTimeSpent={currentTimeSpent}
                        estimatedDuration={todo.estimatedDuration}
                        onTimeUpdate={handleTimeUpdate}
                        onSessionComplete={handleSessionComplete}
                        isFocusMode={todo.focusMode}
                        className="mb-4"
                    />
                </div>
            )}

            {showPomodoro && !todo.completed && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <PomodoroTimer
                        todoId={todo.id}
                        onSessionComplete={handleSessionComplete}
                        className="mb-4"
                    />
                </div>
            )}

            {/* Enhanced Expanded Content */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Description</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                                {todo.description || "No description provided"}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Details</h4>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                    <span className="text-muted-foreground">Priority</span>
                                    <span className="font-medium">{priorityLabels[todo.priority]}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                    <span className="text-muted-foreground">Points</span>
                                    <span className="font-medium">{todo.points}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`font-medium ${todo.completed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {todo.completed ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                                {todo.estimatedDuration && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">Estimated</span>
                                        <span className="font-medium">{formatDuration(todo.estimatedDuration)}</span>
                                    </div>
                                )}
                                {currentTimeSpent > 0 && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-green-50 dark:bg-green-950/30 rounded-md">
                                        <span className="text-muted-foreground">Time Spent</span>
                                        <span className="font-medium text-green-700 dark:text-green-300">{formatDuration(currentTimeSpent)}</span>
                                    </div>
                                )}
                                {todo.pomodoroSessions && todo.pomodoroSessions > 0 && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-purple-50 dark:bg-purple-950/30 rounded-md">
                                        <span className="text-muted-foreground">Pomodoro Sessions</span>
                                        <span className="font-medium text-purple-700 dark:text-purple-300">{todo.pomodoroSessions}</span>
                                    </div>
                                )}
                                {todo.scheduledStartTime && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">Start</span>
                                        <span className="font-medium">{format(new Date(todo.scheduledStartTime), "MMM d, h:mm a")}</span>
                                    </div>
                                )}
                                {todo.scheduledEndTime && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">End</span>
                                        <span className="font-medium">{format(new Date(todo.scheduledEndTime), "MMM d, h:mm a")}</span>
                                    </div>
                                )}
                                {todo.isRecurring && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">Recurring</span>
                                        <span className="font-medium">{todo.recurrencePattern}</span>
                                    </div>
                                )}
                                {todo.completedAt && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-green-50 dark:bg-green-950/30 rounded-md">
                                        <span className="text-muted-foreground">Completed</span>
                                        <span className="font-medium text-green-700 dark:text-green-300">
                                            {format(new Date(todo.completedAt), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
