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
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [optimisticTodo, setOptimisticTodo] = useState<any>(null);

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

    const handleTodoChange = (newTodo?: any) => {
        // Refresh stats when a todo is created/updated/deleted
        fetchStats();

        if (newTodo) {
            // Set optimistic todo for instant UI update
            setOptimisticTodo(newTodo);
            // Clear optimistic todo after a delay to avoid conflicts
            setTimeout(() => setOptimisticTodo(null), 500);
        } else {
            // For updates/deletes, just refresh
            setRefreshTrigger(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
                {/* Mobile-First Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-2 sm:space-y-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                            Todos
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground font-medium">
                            Manage your tasks and stay organized
                        </p>
                    </div>
                    <div className="flex justify-center sm:justify-end">
                        <CreateTodoButton onTodoCreated={handleTodoChange} />
                    </div>
                </div>

                {/* Mobile-Optimized Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {/* Total Stats Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tabular-nums">
                                    {loading ? "..." : stats.totalTodos.toLocaleString()}
                                </p>
                                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full w-full transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Stats Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors duration-300">
                                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Done</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-success tabular-nums">
                                    {loading ? "..." : stats.todosCompleted.toLocaleString()}
                                </p>
                                <div className="h-1 bg-success/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-success rounded-full transition-all duration-500"
                                        style={{ width: `${stats.totalTodos > 0 ? (stats.todosCompleted / stats.totalTodos) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Stats Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors duration-300">
                                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-warning tabular-nums">
                                    {loading ? "..." : stats.pendingTodos.toLocaleString()}
                                </p>
                                <div className="h-1 bg-warning/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-warning rounded-full transition-all duration-500"
                                        style={{ width: `${stats.totalTodos > 0 ? (stats.pendingTodos / stats.totalTodos) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overdue Stats Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors duration-300">
                                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Overdue</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-destructive tabular-nums">
                                    {loading ? "..." : stats.overdueTodos.toLocaleString()}
                                </p>
                                <div className="h-1 bg-destructive/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-destructive rounded-full transition-all duration-500"
                                        style={{ width: `${stats.totalTodos > 0 ? (stats.overdueTodos / stats.totalTodos) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile-Optimized Todo List Container */}
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-soft overflow-hidden">
                    {/* Enhanced Header */}
                    <div className="p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Your Tasks</h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                        {loading ? 'Loading...' : `${stats.totalTodos} total tasks`}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Mobile-Friendly Sort Dropdown */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">Sort by:</span>
                                <select className="text-xs sm:text-sm bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-w-[100px] touch-manipulation">
                                    <option>Due Date</option>
                                    <option>Priority</option>
                                    <option>Created</option>
                                    <option>Progress</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Scrollable Todo List */}
                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto overscroll-contain scroll-smooth">
                        <TodoList onTodoChange={handleTodoChange} refreshTrigger={refreshTrigger} optimisticTodo={optimisticTodo} />
                    </div>
                </div>
            </div>
        </div>
    );
}
