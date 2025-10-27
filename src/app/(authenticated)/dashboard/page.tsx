"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    CheckCircleIcon,
    DocumentTextIcon,
    TrophyIcon,
    FireIcon,
    CalendarIcon,
    ChartBarIcon,
    LightBulbIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import FocusTasks from "@/components/todos/FocusTasks";

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
    const [refreshing, setRefreshing] = useState(false);

    const { data, error, mutate } = useSWR<Stats>("/api/stats", fetcher, { refreshInterval: 30000 });

    useEffect(() => {
        if (data) {
            setStats(data);
            setLoading(false);
        }
    }, [data]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await mutate();
        setRefreshing(false);
    };

    const StatCard = ({
        title,
        value,
        icon: Icon,
        color = 'blue',
        loading: isLoading
    }: {
        title: string;
        value: number | string;
        icon: React.ComponentType<{ className?: string }>;
        color?: string;
        loading?: boolean;
    }) => (
        <div className={`bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-0.5 group ${isLoading ? 'animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/30 ring-1 ring-${color}-200 dark:ring-${color}-800/30`}>
                        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                            {isLoading ? '...' : value}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProgressBar = ({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{Math.min(100, (value / max) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600 transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-muted rounded-lg w-32 animate-pulse"></div>
                    <div className="h-10 bg-muted rounded-lg w-24 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-muted rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse"></div>
                    <div className="space-y-6">
                        <div className="h-48 bg-muted rounded-xl animate-pulse"></div>
                        <div className="h-40 bg-muted rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your productivity overview.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-enhanced shadow-soft hover:shadow-medium"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Points"
                    value={stats.totalPoints.toLocaleString()}
                    icon={TrophyIcon}
                    color="yellow"
                    loading={refreshing}
                />
                <StatCard
                    title="Current Streak"
                    value={`${stats.currentStreak} days`}
                    icon={FireIcon}
                    color="red"
                    loading={refreshing}
                />
                <StatCard
                    title="Active Todos"
                    value={`${stats.todayTodos} of ${stats.pendingTodos}`}
                    icon={CheckCircleIcon}
                    color="green"
                    loading={refreshing}
                />
                <StatCard
                    title="Achievements"
                    value={`${stats.achievementsUnlocked}`}
                    icon={TrophyIcon}
                    color="purple"
                    loading={refreshing}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Focus Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <LightBulbIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Your Focus Tasks
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Based on 80/20 rule - prioritize what matters most
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                    AI Powered
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <FocusTasks />
                        </div>
                    </div>
                </div>

                {/* Right Column - Progress & Stats */}
                <div className="space-y-6">
                    {/* Enhanced Level Progress */}
                    <div className="bg-card border border-border rounded-xl shadow-soft p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Level Progress</h3>
                                <span className="text-2xl">🏆</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Level {stats.level}</span>
                                    <span className="font-medium text-foreground">
                                        {stats.totalPoints.toLocaleString()} / {(stats.level * 100).toLocaleString()} XP
                                    </span>
                                </div>
                                <ProgressBar
                                    value={stats.totalPoints % 100}
                                    max={100}
                                    color="blue"
                                />
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">
                                        {100 - (stats.totalPoints % 100)} XP to next level
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Streak */}
                    <div className="bg-card border border-border rounded-xl shadow-soft p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Current Streak</h3>
                                <span className="text-2xl">🔥</span>
                            </div>
                            <div className="flex items-center justify-center py-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                                            <FireIcon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">
                                        {stats.currentStreak}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        days in a row
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Best: {stats.longestStreak} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-card border border-border rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors duration-200 focus-enhanced">
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                Create New Todo
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors duration-200 focus-enhanced">
                                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                Add Quick Note
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors duration-200 focus-enhanced">
                                <CalendarIcon className="h-5 w-5 text-purple-600" />
                                View Calendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
