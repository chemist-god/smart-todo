"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Pencil,
    Trash2,
    ChevronDown,
    Clock,
    Star,
    Play,
    Pause,
    Square
} from "lucide-react";
import UnifiedTimer from "./UnifiedTimer";

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

interface TimerState {
    isRunning: boolean;
    isPaused: boolean;
    sessionTime: number;
    startTime?: number;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [currentTimeSpent, setCurrentTimeSpent] = useState(todo.totalTimeSpent || 0);

    // Persistent timer state using localStorage
    const getTimerStorageKey = (todoId: string) => `smart_todo_timer_${todoId}`;

    const [timerState, setTimerState] = useState<{
        isRunning: boolean;
        isPaused: boolean;
        sessionTime: number;
        startTime?: number;
    }>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(getTimerStorageKey(todo.id));
            if (saved) {
                const parsed = JSON.parse(saved);
                // Resume session time if timer was running
                if (parsed.isRunning && parsed.startTime) {
                    const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
                    return {
                        ...parsed,
                        sessionTime: parsed.sessionTime + elapsed,
                        startTime: Date.now()
                    };
                }
                return parsed;
            }
        }
        return { isRunning: false, isPaused: false, sessionTime: 0 };
    });

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

    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

    // Format duration helper
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Event handlers
    const handleToggleComplete = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(todo.id, { completed: !todo.completed });
        } catch (error) {
            console.error('Failed to update todo:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this todo?')) {
            setIsUpdating(true);
            try {
                await onDelete(todo.id);
            } catch (error) {
                console.error('Failed to delete todo:', error);
                setIsUpdating(false);
            }
        }
    };

    const handleTimeUpdate = async (timeSpent: number) => {
        try {
            await onUpdate(todo.id, { totalTimeSpent: timeSpent });
        } catch (error) {
            console.error('Failed to update time:', error);
        }
    };

    const handleSessionComplete = async (sessionData: any) => {
        console.log('Session completed:', sessionData);
        // Could integrate with analytics or session tracking here
    };

    // Timer functions are now handled by UnifiedTimer component

    // Persist timer state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(getTimerStorageKey(todo.id), JSON.stringify(timerState));
        }
    }, [timerState, todo.id]);

    const priorityIcons = {
        LOW: "🟢",
        MEDIUM: "🟡",
        HIGH: "🔴",
    };

    return (
        <div className={`bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] group touch-manipulation ${todo.completed
                ? 'border-success/30 bg-success/5 hover:bg-success/10'
                : isOverdue
                    ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
                    : 'hover:border-primary/30 hover:bg-primary/5'
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
                            <h3 className={`text-sm sm:text-base font-semibold leading-tight transition-all duration-200 ${todo.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground group-hover:text-primary"
                                }`}>
                                {todo.title}
                            </h3>
                            {todo.description && (
                                <p className={`text-xs sm:text-sm mt-1 leading-relaxed transition-colors duration-200 line-clamp-2 ${todo.completed
                                        ? "text-muted-foreground/70"
                                        : "text-muted-foreground"
                                    }`}>
                                    {todo.description}
                                </p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 flex-shrink-0">
                            {/* Priority Badge */}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}>
                                <span className="text-xs">
                                    {todo.priority === 'HIGH' ? '🔴' : todo.priority === 'MEDIUM' ? '🟡' : '🟢'}
                                </span>
                                <span className="hidden sm:inline">{priorityLabels[todo.priority]}</span>
                                <span className="sm:hidden">{priorityLabels[todo.priority].charAt(0)}</span>
                            </span>

                            {/* Points Badge */}
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {todo.points}
                            </span>

                            {/* Time Spent Badge */}
                            {currentTimeSpent > 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
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

                {/* Mobile-Optimized Actions */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Unified Smart Timer */}
                    {!todo.completed && (
                        <button
                            onClick={() => setShowTimer(!showTimer)}
                            className={`relative p-2 sm:p-2.5 rounded-xl transition-all duration-200 group min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center touch-manipulation ${showTimer || timerState.isRunning
                                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                                }`}
                            title={showTimer ? 'Hide Timer' : 'Show Timer'}
                        >
                            {timerState.isRunning ? (
                                <div className="flex items-center gap-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${timerState.isPaused
                                            ? 'bg-warning'
                                            : 'bg-primary animate-pulse'
                                        }`} />
                                    <span className="text-xs font-mono font-medium">
                                        {Math.floor(timerState.sessionTime / 60)}:{(timerState.sessionTime % 60).toString().padStart(2, '0')}
                                    </span>
                                    {timerState.isPaused && (
                                        <Pause className="w-2 h-2 text-warning ml-0.5" />
                                    )}
                                </div>
                            ) : timerState.sessionTime > 0 ? (
                                <div className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {Math.floor(timerState.sessionTime / 60)}:{(timerState.sessionTime % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            ) : (
                                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center touch-manipulation"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="p-2 sm:p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center touch-manipulation"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Unified Smart Timer Interface */}
            {showTimer && !todo.completed && (
                <div className="mt-3 pt-3 border-t border-border/30 animate-in slide-in-from-top-2 duration-200">
                    <UnifiedTimer
                        todoId={todo.id}
                        initialTimeSpent={currentTimeSpent}
                        estimatedDuration={todo.estimatedDuration}
                        onTimeUpdate={handleTimeUpdate}
                        onSessionComplete={handleSessionComplete}
                        timerState={timerState}
                        onStateChange={setTimerState}
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
                                        <span className="text-muted-foreground">Focus Time</span>
                                        <span className="font-medium text-success">{formatDuration(currentTimeSpent)}</span>
                                    </div>
                                )}
                                {todo.timerStartTime && (
                                    <div className="flex justify-between items-center py-1.5 px-3 bg-info/10 rounded-md">
                                        <span className="text-muted-foreground">
                                            {todo.completed ? 'Total Duration' : 'Time Since Started'}
                                        </span>
                                        <span className="font-medium text-info">
                                            {(() => {
                                                const startTime = new Date(todo.timerStartTime);
                                                const endTime = todo.completedAt ? new Date(todo.completedAt) : new Date();
                                                const diffMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
                                                return formatDuration(diffMinutes);
                                            })()}
                                        </span>
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
