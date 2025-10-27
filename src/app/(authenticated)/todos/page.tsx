"use client";

import { useState, useEffect } from "react";
import TodoList from "@/components/todos/TodoList";
import CreateTodoButton from "@/components/todos/CreateTodoButton";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface Stats {
    totalTodos: number;
    pendingTodos: number;
    overdueTodos: number;
    todosCompleted: number;
}

export default function TodosPage() {
    const [stats, setStats] = useState<Stats>({
        totalTodos: 0,
        pendingTodos: 0,
        overdueTodos: 0,
        todosCompleted: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalTodos: data.totalTodos,
                    pendingTodos: data.pendingTodos,
                    overdueTodos: data.overdueTodos,
                    todosCompleted: data.todosCompleted,
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleTodoCreated = () => {
        // Refresh stats when a todo is created
        fetchStats();
    };

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">Todos</h1>
                    <p className="text-muted-foreground">Manage your tasks and stay organized</p>
                </div>
                <CreateTodoButton onTodoCreated={handleTodoCreated} />
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="bg-card border border-border rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold text-foreground">
                                {loading ? "..." : stats.totalTodos.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {loading ? "..." : stats.todosCompleted.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {loading ? "..." : stats.pendingTodos.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                            <CheckCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {loading ? "..." : stats.overdueTodos.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                            <CheckCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Todo List */}
            <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <CheckCircleIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Your Tasks</h2>
                                <p className="text-sm text-muted-foreground">
                                    {loading ? 'Loading...' : `${stats.totalTodos} total tasks`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Sort by:</span>
                            <select className="text-xs bg-background border border-border rounded-md px-2 py-1 focus-enhanced">
                                <option>Due Date</option>
                                <option>Priority</option>
                                <option>Created</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <TodoList onTodoChange={handleTodoCreated} />
                </div>
            </div>
        </div>
    );
}
