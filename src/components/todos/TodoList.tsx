"use client";

import { useState, useEffect } from "react";
import TodoItem from "./TodoItem";
import { FunnelIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

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

interface TodoListProps {
    onTodoChange?: () => void;
    refreshTrigger?: number;
    optimisticTodo?: Todo | null;
}

export default function TodoList({ onTodoChange, refreshTrigger, optimisticTodo }: TodoListProps) {
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [sortBy, setSortBy] = useState<"created" | "due" | "priority">("created");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTodos();
    }, [filter, sortBy]);

    // Handle optimistic todo insertion
    useEffect(() => {
        if (optimisticTodo) {
            // Add the optimistic todo to the top of the list immediately
            setTodos(prevTodos => {
                // Remove any existing todo with the same ID to prevent duplicates
                const filteredTodos = prevTodos.filter(todo => todo.id !== optimisticTodo.id);
                // Add the new todo at the top
                return [optimisticTodo, ...filteredTodos];
            });

            // Refresh in background to ensure consistency
            setTimeout(() => {
                fetchTodos();
            }, 200);
        }
    }, [optimisticTodo]);

    // Trigger refresh when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger !== undefined) {
            // Add a small delay to handle potential race conditions
            const timer = setTimeout(() => {
                fetchTodos();
            }, 100); // 100ms delay to ensure database consistency

            return () => clearTimeout(timer);
        }
    }, [refreshTrigger]);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                filter,
                sortBy,
            });

            const response = await fetch(`/api/todos?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch todos');
            }

            const data = await response.json();
            setTodos(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleTodoUpdate = async (todoId: string, updates: Partial<Todo>) => {
        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            // Refresh the todos list
            await fetchTodos();

            // Notify parent component
            if (onTodoChange) {
                onTodoChange();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update todo');
        }
    };

    const handleTodoDelete = async (todoId: string) => {
        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete todo');
            }

            // Refresh the todos list
            await fetchTodos();

            // Notify parent component
            if (onTodoChange) {
                onTodoChange();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todo');
        }
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Enhanced Loading State */}
                <div className="bg-card border border-border rounded-xl shadow-soft p-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <div className="relative mx-auto">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
                                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10"></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-foreground">Loading your todos</p>
                                <p className="text-sm text-muted-foreground">Fetching your latest tasks...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-red-800 dark:text-red-200 font-medium">Error loading todos</p>
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={fetchTodos}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus-enhanced"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Filters and Sort */}
            <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-soft">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <FunnelIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Filter:</span>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-1">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                                    filter === "all"
                                        ? "bg-primary text-primary-foreground shadow-soft"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                }`}
                            >
                                All ({todos.length})
                            </button>
                            <button
                                onClick={() => setFilter("active")}
                                className={`px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                                    filter === "active"
                                        ? "bg-primary text-primary-foreground shadow-soft"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                }`}
                            >
                                Active ({todos.filter(t => !t.completed).length})
                            </button>
                            <button
                                onClick={() => setFilter("completed")}
                                className={`px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                                    filter === "completed"
                                        ? "bg-primary text-primary-foreground shadow-soft"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                }`}
                            >
                                Completed ({todos.filter(t => t.completed).length})
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <AdjustmentsHorizontalIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground hidden sm:inline">Sort:</span>
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-lg focus-enhanced hover:bg-muted transition-colors min-w-0"
                        >
                            <option value="created">Created Date</option>
                            <option value="due">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Enhanced Todo List */}
            <div className="space-y-4">
                {filteredTodos.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl shadow-soft p-8 sm:p-12 text-center">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                            {filter === "all"
                                ? "No todos yet"
                                : `No ${filter} todos`
                            }
                        </h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto text-sm sm:text-base">
                            {filter === "all"
                                ? "Create your first todo to start building productive habits and achieving your goals!"
                                : `You don't have any ${filter} todos at the moment.`
                            }
                        </p>
                        {filter === "all" && (
                            <button className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced text-sm sm:text-base">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Your First Todo
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTodos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onUpdate={handleTodoUpdate}
                                onDelete={handleTodoDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
