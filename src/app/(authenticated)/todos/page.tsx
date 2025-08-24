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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
                    <p className="text-gray-600">Manage your tasks and stay organized</p>
                </div>
                <CreateTodoButton onTodoCreated={handleTodoCreated} />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats.totalTodos}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats.todosCompleted}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats.pendingTodos}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Overdue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats.overdueTodos}
                    </p>
                </div>
            </div>

            <TodoList onTodoChange={handleTodoCreated} />
        </div>
    );
}
