"use client";

import { useState, useEffect } from "react";
import {
    CheckCircleIcon,
    DocumentTextIcon,
    TrophyIcon,
    FireIcon,
    CalendarIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

interface Stats {
    totalPoints: number;
    level: number;
    xpToNextLevel: number;
    currentStreak: number;
    longestStreak: number;
    todosCompleted: number;
    notesCreated: number;
    achievementsUnlocked: number;
    totalTodos: number;
    pendingTodos: number;
    overdueTodos: number;
    todayTodos: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalPoints: 0,
        level: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        todosCompleted: 0,
        notesCreated: 0,
        achievementsUnlocked: 0,
        totalTodos: 0,
        pendingTodos: 0,
        overdueTodos: 0,
        todayTodos: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
                    <p className="text-blue-100">Loading your stats...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
                <p className="text-blue-100">Ready to crush your goals today? Let's get productive! 🚀</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Todos</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalTodos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.todosCompleted}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Notes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.notesCreated}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <TrophyIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Points</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Progress */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
                        <FireIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Daily Goal</span>
                                <span className="text-gray-900">{stats.todayTodos}/5 tasks</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((stats.todayTodos / 5) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Streak</span>
                                <span className="text-gray-900">{stats.currentStreak} days</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((stats.currentStreak / 7) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">New Todo</p>
                            <p className="text-xs text-gray-600">Add a task</p>
                        </button>
                        <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                            <DocumentTextIcon className="w-5 h-5 text-purple-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">New Note</p>
                            <p className="text-xs text-gray-600">Capture thoughts</p>
                        </button>
                        <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                            <CalendarIcon className="w-5 h-5 text-green-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">View Calendar</p>
                            <p className="text-xs text-gray-600">Schedule tasks</p>
                        </button>
                        <button className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left">
                            <ChartBarIcon className="w-5 h-5 text-yellow-600 mb-2" />
                            <p className="text-sm font-medium text-gray-900">Analytics</p>
                            <p className="text-xs text-gray-600">View progress</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Todos</h2>
                    <div className="space-y-3">
                        <div className="text-center py-8">
                            <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                {stats.totalTodos === 0
                                    ? "No todos yet. Create your first todo to get started!"
                                    : "Recent todos will appear here."
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notes</h2>
                    <div className="space-y-3">
                        <div className="text-center py-8">
                            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                {stats.notesCreated === 0
                                    ? "No notes yet. Start taking notes to keep track of your thoughts!"
                                    : "Recent notes will appear here."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
