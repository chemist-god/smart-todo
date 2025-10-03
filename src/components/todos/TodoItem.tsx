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
        <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${todo.completed ? 'border-green-200 bg-green-50' :
            isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}>
            <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={handleToggleComplete}
                    disabled={isUpdating}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors disabled:opacity-50"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className={`text-sm font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-900"
                                }`}>
                                {todo.title}
                            </h3>
                            {todo.description && (
                                <p className={`text-sm mt-1 ${todo.completed ? "text-gray-400" : "text-gray-600"
                                    }`}>
                                    {todo.description}
                                </p>
                            )}
                        </div>

                        {/* Priority Badge */}
                        <div className="flex items-center space-x-2 ml-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[todo.priority]}`}>
                                <span className="mr-1">{priorityIcons[todo.priority]}</span>
                                {priorityLabels[todo.priority]}
                            </span>

                            {/* Points Badge */}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <StarIcon className="w-3 h-3 mr-1" />
                                {todo.points}
                            </span>

                            {/* Time Spent Badge */}
                            {currentTimeSpent > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {formatDuration(currentTimeSpent)}
                                </span>
                            )}

                            {/* Pomodoro Sessions Badge */}
                            {todo.pomodoroSessions && todo.pomodoroSessions > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    🍅 {todo.pomodoroSessions}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        {todo.dueDate && (
                            <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                                <ClockIcon className="w-3 h-3 mr-1" />
                                <span>
                                    {isOverdue ? 'Overdue' : 'Due'}: {format(new Date(todo.dueDate), "MMM d, yyyy")}
                                </span>
                            </div>
                        )}
                        <span>Created {format(new Date(todo.createdAt), "MMM d")}</span>
                        {todo.completedAt && (
                            <span>Completed {format(new Date(todo.completedAt), "MMM d")}</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                    {/* Timer Controls */}
                    {!todo.completed && (
                        <>
                            <button
                                onClick={() => setShowTimer(!showTimer)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Timer"
                            >
                                <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowPomodoro(!showPomodoro)}
                                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                                title="Pomodoro"
                            >
                                🍅
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Expand"
                    >
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isUpdating}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Timer Components */}
            {showTimer && !todo.completed && (
                <div className="mt-4 pt-4 border-t border-gray-200">
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <PomodoroTimer
                        todoId={todo.id}
                        onSessionComplete={handleSessionComplete}
                        className="mb-4"
                    />
                </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Description</h4>
                            <p className="text-sm text-gray-600">
                                {todo.description || "No description provided"}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Details</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div>Priority: {priorityLabels[todo.priority]}</div>
                                <div>Points: {todo.points}</div>
                                <div>Status: {todo.completed ? 'Completed' : 'Pending'}</div>
                                {todo.estimatedDuration && (
                                    <div>Estimated: {formatDuration(todo.estimatedDuration)}</div>
                                )}
                                {currentTimeSpent > 0 && (
                                    <div>Time Spent: {formatDuration(currentTimeSpent)}</div>
                                )}
                                {todo.pomodoroSessions && todo.pomodoroSessions > 0 && (
                                    <div>Pomodoro Sessions: {todo.pomodoroSessions}</div>
                                )}
                                {todo.scheduledStartTime && (
                                    <div>Start: {format(new Date(todo.scheduledStartTime), "MMM d, h:mm a")}</div>
                                )}
                                {todo.scheduledEndTime && (
                                    <div>End: {format(new Date(todo.scheduledEndTime), "MMM d, h:mm a")}</div>
                                )}
                                {todo.isRecurring && (
                                    <div>Recurring: {todo.recurrencePattern}</div>
                                )}
                                {todo.completedAt && (
                                    <div>Completed: {format(new Date(todo.completedAt), "MMM d, yyyy 'at' h:mm a")}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
