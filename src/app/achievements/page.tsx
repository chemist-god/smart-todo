"use client";

import { useState, useEffect } from "react";
import AchievementList from "@/components/achievements/AchievementList";
import { TrophyIcon, FireIcon, StarIcon } from "@heroicons/react/24/outline";

interface Stats {
    totalPoints: number;
    level: number;
    xpToNextLevel: number;
    currentStreak: number;
    longestStreak: number;
    todosCompleted: number;
    notesCreated: number;
    achievementsUnlocked: number;
}

export default function AchievementsPage() {
    const [stats, setStats] = useState<Stats>({
        totalPoints: 0,
        level: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        todosCompleted: 0,
        notesCreated: 0,
        achievementsUnlocked: 0,
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
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">Achievements</h1>
                    <p className="text-yellow-100">Loading your achievements...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Achievements</h1>
                <p className="text-yellow-100">Track your progress and unlock rewards for staying productive! 🏆</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <StarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Points</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrophyIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Unlocked</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.achievementsUnlocked}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrophyIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">5</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <FireIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Current Streak</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Level Progress */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Level Progress</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Current Level</span>
                                <span className="text-gray-900 font-medium">Level {stats.level}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${100 - (stats.xpToNextLevel / 100) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{stats.xpToNextLevel} XP to next level</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.todosCompleted}</p>
                                <p className="text-xs text-gray-600">Todos Completed</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.notesCreated}</p>
                                <p className="text-xs text-gray-600">Notes Created</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
                                <p className="text-xs text-gray-600">Days Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Achievements */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h2>
                    <div className="space-y-3">
                        <div className="text-center py-8">
                            <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                {stats.achievementsUnlocked === 0
                                    ? "No achievements unlocked yet. Start completing tasks to earn rewards!"
                                    : "Recent achievements will appear here."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <AchievementList />
        </div>
    );
}
