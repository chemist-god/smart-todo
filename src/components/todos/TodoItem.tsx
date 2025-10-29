"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { ArrowPathIcon } from "@heroicons/react/24/outline";

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

    // Timer control functions
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = useCallback(() => {
        if (!timerState.isRunning) {
            const newState = {
                ...timerState,
                isRunning: true,
                isPaused: false,
                startTime: Date.now()
            };
            setTimerState(newState);

            intervalRef.current = setInterval(() => {
                setTimerState(prev => ({
                    ...prev,
                    sessionTime: prev.sessionTime + 1
                }));
            }, 1000);
        }
    }, [timerState]);

    const pauseTimer = useCallback(() => {
        if (timerState.isRunning && !timerState.isPaused) {
            setTimerState({
                ...timerState,
                isPaused: true
            });
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [timerState]);

    const resumeTimer = useCallback(() => {
        if (timerState.isRunning && timerState.isPaused) {
            setTimerState({
                ...timerState,
                isPaused: false,
                startTime: Date.now()
            });

            intervalRef.current = setInterval(() => {
                setTimerState(prev => ({
                    ...prev,
                    sessionTime: prev.sessionTime + 1
                }));
            }, 1000);
        }
    }, [timerState]);

    const stopTimer = useCallback(async () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Save session if there was meaningful time
        if (timerState.sessionTime > 0) {
            const sessionMinutes = Math.floor(timerState.sessionTime / 60);
            const newTotal = currentTimeSpent + sessionMinutes;
            setCurrentTimeSpent(newTotal);
            await handleTimeUpdate(newTotal);
            await handleSessionComplete({
                duration: timerState.sessionTime,
                sessionType: 'FOCUS'
            });
        }

        // Reset timer state
        setTimerState({
            isRunning: false,
            isPaused: false,
            sessionTime: 0
        });
    }, [timerState, currentTimeSpent, handleTimeUpdate, handleSessionComplete]);

    const resetTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setTimerState({
            isRunning: false,
            isPaused: false,
            sessionTime: 0
        });
    }, []);

    // Auto-resume timer if it was running
    useEffect(() => {
        if (timerState.isRunning && !timerState.isPaused && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTimerState(prev => ({
                    ...prev,
                    sessionTime: prev.sessionTime + 1
                }));
            }, 1000);
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState.isRunning, timerState.isPaused]);

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
        <div className={`bg-card border border-border rounded-xl p-2.5 sm:p-3 lg:p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5 group ${
            todo.completed
                ? 'border-success/30 bg-success/5'
                : isOverdue
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'hover:border-primary/20'
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
                                <p className={`text-xs sm:text-sm mt-1 leading-relaxed transition-colors duration-200 line-clamp-2 ${
                                    todo.completed
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
                                <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {todo.points}
                            </span>

                            {/* Time Spent Badge */}
                            {currentTimeSpent > 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
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
                    {/* Unified Smart Timer */}
                    {!todo.completed && (
                        <button
                            onClick={() => setShowTimer(!showTimer)}
                            className={`relative p-1 sm:p-1.5 rounded-md transition-all duration-200 group ${
                                showTimer || timerState.isRunning
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            }`}
                            title={showTimer ? 'Hide Timer' : 'Show Timer'}
                        >
                            {timerState.isRunning ? (
                                <div className="flex items-center gap-0.5">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    <span className="text-xs font-mono font-medium">
                                        {Math.floor(timerState.sessionTime / 60)}:{(timerState.sessionTime % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            ) : (
                                <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 sm:p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-all duration-200"
                        title="Expand"
                    >
                        <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="p-1 sm:p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                    >
                        <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>

            {/* Unified Smart Timer Interface */}
            {showTimer && !todo.completed && (
                <div className="mt-3 pt-3 border-t border-border/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                        {/* Timer Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <ClockIcon className="w-3 h-3 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">Focus Timer</h4>
                                <p className="text-xs text-muted-foreground">Track your productivity</p>
                            </div>
                        </div>

                        {/* Timer Display */}
                        <div className="text-center mb-3">
                            <div className="text-xl font-mono font-bold text-foreground mb-1">
                                {Math.floor(timerState.sessionTime / 60)}:{(timerState.sessionTime % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Session Time
                            </div>
                            <div className="text-sm font-medium text-primary">
                                Total: {Math.floor(currentTimeSpent / 60)}h {currentTimeSpent % 60}m
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {todo.estimatedDuration && (
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Progress</span>
                                    <span className="font-medium">{Math.round((currentTimeSpent / todo.estimatedDuration) * 100)}%</span>
                                </div>
                                <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${Math.min((currentTimeSpent / todo.estimatedDuration) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Timer Controls */}
                        <div className="flex justify-center gap-1.5">
                            {!timerState.isRunning ? (
                                <button
                                    onClick={startTimer}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
                                >
                                    <PlayIcon className="w-3 h-3" />
                                    <span>Start</span>
                                </button>
                            ) : timerState.isPaused ? (
                                <button
                                    onClick={resumeTimer}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
                                >
                                    <PlayIcon className="w-3 h-3" />
                                    <span>Resume</span>
                                </button>
                            ) : (
                                <button
                                    onClick={pauseTimer}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-all duration-200 text-sm font-medium"
                                >
                                    <PauseIcon className="w-3 h-3" />
                                    <span>Pause</span>
                                </button>
                            )}

                            {timerState.isRunning && (
                                <button
                                    onClick={stopTimer}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all duration-200 text-sm font-medium"
                                >
                                    <StopIcon className="w-3 h-3" />
                                    <span>Stop</span>
                                </button>
                            )}

                            <button
                                onClick={resetTimer}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 hover:text-foreground transition-all duration-200 text-sm font-medium"
                            >
                                <ArrowPathIcon className="w-3 h-3" />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
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
