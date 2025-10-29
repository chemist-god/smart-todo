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
            <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-lg sm:rounded-xl p-4 sm:p-6 text-primary-foreground shadow-strong">
                    <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Achievements</h1>
                    <p className="text-primary-foreground/80 text-sm sm:text-base">Loading your achievements...</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-6 sm:h-8 bg-muted rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-lg sm:rounded-xl p-4 sm:p-6 text-primary-foreground shadow-strong relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
                <div className="relative">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Achievements</h1>
                    <p className="text-primary-foreground/90 text-base sm:text-lg">Track your progress and unlock rewards for staying productive! 🏆</p>
                </div>
                {/* Decorative elements - hidden on mobile for cleaner look */}
                <div className="hidden sm:block absolute top-4 right-4 opacity-20">
                    <TrophyIcon className="w-8 sm:w-12 h-8 sm:h-12" />
                </div>
                <div className="hidden sm:block absolute bottom-4 right-8 sm:right-12 opacity-10">
                    <StarIcon className="w-6 sm:w-8 h-6 sm:h-8" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-card p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 group">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors duration-300">
                            <StarIcon className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Points</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 group">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-success/10 rounded-lg group-hover:bg-success/15 transition-colors duration-300">
                            <TrophyIcon className="w-5 sm:w-6 h-5 sm:h-6 text-success" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Unlocked</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.achievementsUnlocked}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 group">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-info/10 rounded-lg group-hover:bg-info/15 transition-colors duration-300">
                            <TrophyIcon className="w-5 sm:w-6 h-5 sm:h-6 text-info" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">5</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 group">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-warning/10 rounded-lg group-hover:bg-warning/15 transition-colors duration-300">
                            <FireIcon className="w-5 sm:w-6 h-5 sm:h-6 text-warning" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Current Streak</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.currentStreak} days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Level Progress */}
                <div className="bg-card p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft relative overflow-hidden group hover:shadow-medium transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-6 sm:-translate-y-8 translate-x-6 sm:translate-x-8"></div>
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">Level Progress</h2>
                            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                                <TrophyIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                                Level {stats.level}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-muted-foreground">XP Progress</span>
                                    <span className="text-foreground font-medium">{stats.totalPoints.toLocaleString()} XP</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm relative"
                                        style={{ width: `${Math.min(100, (stats.totalPoints / 100) * 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{stats.xpToNextLevel} XP to next level</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                                <div className="space-y-1 p-2 sm:p-3 bg-muted/30 rounded-lg">
                                    <p className="text-lg sm:text-xl font-bold text-foreground">{stats.todosCompleted}</p>
                                    <p className="text-xs text-muted-foreground">Todos</p>
                                </div>
                                <div className="space-y-1 p-2 sm:p-3 bg-muted/30 rounded-lg">
                                    <p className="text-lg sm:text-xl font-bold text-foreground">{stats.notesCreated}</p>
                                    <p className="text-xs text-muted-foreground">Notes</p>
                                </div>
                                <div className="space-y-1 p-2 sm:p-3 bg-muted/30 rounded-lg">
                                    <p className="text-lg sm:text-xl font-bold text-foreground">{stats.currentStreak}</p>
                                    <p className="text-xs text-muted-foreground">Streak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Achievements */}
                <div className="bg-card p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft relative overflow-hidden group hover:shadow-medium transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-success/5 to-transparent rounded-full -translate-y-6 sm:-translate-y-8 translate-x-6 sm:translate-x-8"></div>
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Achievements</h2>
                            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-success/10 text-success rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                                <TrophyIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                                {stats.achievementsUnlocked} Unlocked
                            </div>
                        </div>
                        <div className="space-y-3">
                            {stats.achievementsUnlocked > 0 ? (
                                <div className="text-center py-4 sm:py-6">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                        <TrophyIcon className="w-6 sm:w-8 h-6 sm:h-8 text-success" />
                                    </div>
                                    <p className="text-foreground font-medium mb-1 text-sm sm:text-base">🎉 Congratulations!</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed px-2">
                                        You've unlocked {stats.achievementsUnlocked} achievement{stats.achievementsUnlocked !== 1 ? 's' : ''}!
                                        Keep up the great work to unlock more.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                        <TrophyIcon className="w-6 sm:w-8 h-6 sm:h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-foreground font-medium mb-1 text-sm sm:text-base">Ready to Start?</p>
                                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed px-2">
                                        Complete tasks, create notes, and maintain your streak to unlock your first achievements!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                            <StarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm sm:text-base">View All Achievements</p>
                            <p className="text-xs text-muted-foreground">See detailed progress</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="p-2 bg-success/10 rounded-lg group-hover:bg-success/15 transition-colors">
                            <TrophyIcon className="w-4 sm:w-5 h-4 sm:h-5 text-success" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm sm:text-base">Share Progress</p>
                            <p className="text-xs text-muted-foreground">Celebrate milestones</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/15 transition-colors">
                            <FireIcon className="w-4 sm:w-5 h-4 sm:h-5 text-warning" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm sm:text-base">View Leaderboard</p>
                            <p className="text-xs text-muted-foreground">Compare with friends</p>
                        </div>
                    </div>
                </div>
            </div>

            <AchievementList />
        </div>
    );
}
