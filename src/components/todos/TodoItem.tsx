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
        LOW: "bg-success/10 text-success border-success/20",
        MEDIUM: "bg-warning/10 text-warning border-warning/20",
        HIGH: "bg-destructive/10 text-destructive border-destructive/20",
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
        <div className={`bg-card border border-border rounded-xl p-3 sm:p-4 hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 group ${
            todo.completed
                ? 'border-success/50 bg-success/5'
                : isOverdue
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'hover:border-primary/30'
        }`}>
            <div className="flex items-start gap-2 sm:gap-3">
                {/* Enhanced Checkbox */}
                <div className="flex-shrink-0 mt-0.5">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={handleToggleComplete}
                        disabled={isUpdating}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-primary bg-background border-2 border-border rounded-md focus:ring-primary/30 focus:ring-2 focus:ring-offset-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/70"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-sm sm:text-base font-semibold leading-tight transition-all duration-200 ${
                                todo.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground group-hover:text-primary"
                            }`}>
                                {todo.title}
                            </h3>
                            {todo.description && (
                                <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 leading-relaxed transition-colors duration-200 ${
                                    todo.completed
                                        ? "text-muted-foreground/70"
                                        : "text-muted-foreground"
                                }`}>
                                    {todo.description}
                                </p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {/* Priority Badge */}
                            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}>
                                <span className="text-xs">
                                    {todo.priority === 'HIGH' ? '🔴' : todo.priority === 'MEDIUM' ? '🟡' : '🟢'}
                                </span>
                                <span className="hidden sm:inline">{priorityLabels[todo.priority]}</span>
                                <span className="sm:hidden">{priorityLabels[todo.priority].charAt(0)}</span>
                            </span>

                            {/* Points Badge */}
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {todo.points}
                            </span>

                            {/* Time Spent Badge */}
                            {currentTimeSpent > 0 && (
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                                    <ClockIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {formatDuration(currentTimeSpent)}
                                </span>
                            )}

                            {/* Pomodoro Sessions Badge */}
                            {todo.pomodoroSessions && todo.pomodoroSessions > 0 && (
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-info/10 text-info border border-info/20">
                                    🍅 {todo.pomodoroSessions}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                        {todo.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                                <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                <span className="font-medium truncate">
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
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    {/* Timer Controls */}
                    {!todo.completed && (
                        <>
                            <button
                                onClick={() => setShowTimer(!showTimer)}
                                className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 focus-enhanced"
                                title="Timer"
                            >
                                <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setShowPomodoro(!showPomodoro)}
                                className="p-1.5 sm:p-2 text-muted-foreground hover:text-info hover:bg-info/10 rounded-lg transition-all duration-200 focus-enhanced"
                                title="Pomodoro"
                            >
                                🍅
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 focus-enhanced"
                        title="Expand"
                    >
                        <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-enhanced"
                        title="Delete"
                    >
                        <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Description</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                                {todo.description || "No description provided"}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Details</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
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
                                    <span className={`font-medium ${todo.completed ? 'text-success' : 'text-warning'}`}>
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
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-success/10 rounded-md">
                                        <span className="text-muted-foreground">Time Spent</span>
                                        <span className="font-medium text-success">{formatDuration(currentTimeSpent)}</span>
                                    </div>
                                )}
                                {todo.pomodoroSessions && todo.pomodoroSessions > 0 && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-info/10 rounded-md">
                                        <span className="text-muted-foreground">Pomodoro Sessions</span>
                                        <span className="font-medium text-info">{todo.pomodoroSessions}</span>
                                    </div>
                                )}
                                {todo.scheduledStartTime && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">Start</span>
                                        <span className="font-medium text-xs sm:text-sm">{format(new Date(todo.scheduledStartTime), "MMM d, h:mm a")}</span>
                                    </div>
                                )}
                                {todo.scheduledEndTime && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">End</span>
                                        <span className="font-medium text-xs sm:text-sm">{format(new Date(todo.scheduledEndTime), "MMM d, h:mm a")}</span>
                                    </div>
                                )}
                                {todo.isRecurring && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-muted/30 rounded-md">
                                        <span className="text-muted-foreground">Recurring</span>
                                        <span className="font-medium">{todo.recurrencePattern}</span>
                                    </div>
                                )}
                                {todo.completedAt && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-success/10 rounded-md">
                                        <span className="text-muted-foreground">Completed</span>
                                        <span className="font-medium text-success text-xs sm:text-sm">
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
