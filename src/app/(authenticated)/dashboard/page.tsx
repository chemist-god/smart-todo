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
        <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg ${isLoading ? 'animate-pulse' : ''}`}>
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md bg-${color}-500 bg-opacity-10 p-3`}>
                        <Icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {isLoading ? '...' : value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProgressBar = ({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
                className={`h-2.5 rounded-full bg-${color}-500`}
                style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
            ></div>
        </div>
    );

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={refreshing}
                >
                    <ArrowPathIcon className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Points"
                    value={stats.totalPoints}
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
                    title="Todos Today"
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

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Focus Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    <LightBulbIcon className="h-5 w-5 inline-block mr-2 text-yellow-500" />
                                    Your Focus Tasks
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Based on 80/20 rule
                                </span>
                            </div>
                            <div className="mt-4">
                                <FocusTasks />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Progress */}
                <div className="space-y-6">
                    {/* Level Progress */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Level Progress</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Level {stats.level}</span>
                                    <span className="font-medium">{stats.totalPoints} / {stats.xpToNextLevel} XP</span>
                                </div>
                                <ProgressBar
                                    value={stats.totalPoints % 100}
                                    max={100}
                                    color="blue"
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                    {100 - (stats.totalPoints % 100)} XP to next level
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Streak</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                                        <FireIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        {stats.currentStreak} days
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Best: {stats.longestStreak} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
