"use client";

import { useState, useEffect } from "react";
import {
    TrophyIcon,
    FireIcon,
    StarIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

interface LeaderboardUser {
    id: string;
    name: string;
    image?: string;
    rank: number;
    totalEarned: number;
    totalStakes: number;
    successRate: number;
    currentStreak: number;
    longestStreak: number;
    badges: string[];
    isCurrentUser: boolean;
}

interface LeaderboardData {
    topEarners: LeaderboardUser[];
    topPerformers: LeaderboardUser[];
    topStreaks: LeaderboardUser[];
    recentWinners: LeaderboardUser[];
    totalUsers: number;
    totalStakes: number;
    totalEarned: number;
}

interface StakeLeaderboardProps {
    userId: string;
}

export default function StakeLeaderboard({ userId }: StakeLeaderboardProps) {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'earners' | 'performers' | 'streaks'>('earners');

    useEffect(() => {
        fetchLeaderboardData();
    }, [userId]);

    const fetchLeaderboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/leaderboard/stakes?userId=${userId}`);
            if (response.ok) {
                const leaderboardData = await response.json();
                setData(leaderboardData);
            }
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <TrophyIcon className="h-6 w-6 text-gray-400" />;
            case 3:
                return <TrophyIcon className="h-6 w-6 text-orange-500" />;
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
        }
    };

    const getBadgeIcon = (badge: string) => {
        switch (badge) {
            case 'STREAK_MASTER':
                return <FireIcon className="h-4 w-4 text-orange-500" />;
            case 'HIGH_EARNER':
                return <CurrencyDollarIcon className="h-4 w-4 text-green-500" />;
            case 'PERFECTIONIST':
                return <StarIcon className="h-4 w-4 text-purple-500" />;
            case 'SOCIAL_BUTTERFLY':
                return <UserGroupIcon className="h-4 w-4 text-blue-500" />;
            default:
                return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 sm:p-6 shadow-soft">
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 sm:p-6 shadow-soft">
                <div className="text-center">
                    <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrophyIcon className="h-6 w-6 text-warning" />
                    </div>
                    <p className="text-sm text-muted-foreground">No leaderboard data available</p>
                </div>
            </div>
        );
    }

    const getCurrentLeaderboard = () => {
        switch (activeTab) {
            case 'earners':
                return data.topEarners;
            case 'performers':
                return data.topPerformers;
            case 'streaks':
                return data.topStreaks;
            default:
                return data.topEarners;
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'earners':
                return 'Top Earners';
            case 'performers':
                return 'Top Performers';
            case 'streaks':
                return 'Longest Streaks';
            default:
                return 'Top Earners';
        }
    };

    return (
        <div className="space-y-4">
            {/* Compact Aurora Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3 sm:p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                            <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Users</p>
                            <p className="text-lg sm:text-xl font-bold text-primary tabular-nums">{data.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3 sm:p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors duration-300">
                            <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Stakes</p>
                            <p className="text-lg sm:text-xl font-bold text-warning tabular-nums">{data.totalStakes}</p>
                        </div>
                    </div>
                </div>

                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3 sm:p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors duration-300">
                            <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Earned</p>
                            <p className="text-lg sm:text-xl font-bold text-success tabular-nums">₵{data.totalEarned.toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aurora Leaderboard */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-soft overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-border/30">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center">
                            <div className="p-1.5 bg-warning/10 rounded-lg mr-2">
                                <TrophyIcon className="h-4 w-4 text-warning" />
                            </div>
                            {getTabTitle()}
                        </h3>

                        {/* Aurora Tab Navigation */}
                        <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('earners')}
                                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'earners'
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                Earners
                            </button>
                            <button
                                onClick={() => setActiveTab('performers')}
                                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'performers'
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                Performers
                            </button>
                            <button
                                onClick={() => setActiveTab('streaks')}
                                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'streaks'
                                    ? 'bg-primary text-primary-foreground shadow-soft'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                Streaks
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                        {getCurrentLeaderboard().map((user, index) => (
                            <div
                                key={user.id}
                                className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-200 hover:shadow-soft ${user.isCurrentUser
                                    ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                                    : 'bg-card/40 hover:bg-card/60 border border-border/20'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                        {getRankIcon(user.rank)}
                                    </div>

                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                                        <span className="text-primary font-semibold text-xs sm:text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">{user.name}</h4>
                                            {user.isCurrentUser && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                                                    You
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-muted-foreground">
                                            <span className="tabular-nums">{user.totalStakes} stakes</span>
                                            <span className="text-muted-foreground/50">•</span>
                                            <span className="tabular-nums">{user.successRate}% success</span>
                                            {activeTab === 'streaks' ? (
                                                <>
                                                    <span className="text-muted-foreground/50">•</span>
                                                    <span className="flex items-center text-warning">
                                                        <FireIcon className="h-3 w-3 mr-1" />
                                                        <span className="tabular-nums">{user.currentStreak}</span>
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-muted-foreground/50">•</span>
                                                    <span className="text-success font-medium tabular-nums">₵{user.totalEarned.toFixed(0)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Aurora Badges */}
                                <div className="flex items-center space-x-1 ml-2">
                                    {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                                        <div
                                            key={badgeIndex}
                                            className="p-1 bg-card border border-border/30 rounded-lg shadow-sm hover:shadow-soft transition-shadow duration-200"
                                            title={badge.replace('_', ' ')}
                                        >
                                            {getBadgeIcon(badge)}
                                        </div>
                                    ))}
                                    {user.badges.length > 2 && (
                                        <span className="text-xs text-muted-foreground font-medium">
                                            +{user.badges.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Aurora Recent Winners */}
            {data.recentWinners.length > 0 && (
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-soft p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center">
                        <div className="p-1.5 bg-success/10 rounded-lg mr-2">
                            <StarIcon className="h-4 w-4 text-success" />
                        </div>
                        Recent Winners
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.recentWinners.map((winner) => (
                            <div key={winner.id} className="group p-3 bg-success/5 hover:bg-success/10 rounded-xl border border-success/20 transition-all duration-200 hover:shadow-soft">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-success/10 group-hover:bg-success/20 rounded-full flex items-center justify-center transition-colors duration-200">
                                        <span className="text-success font-semibold text-sm">
                                            {winner.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-medium text-foreground text-sm truncate">{winner.name}</h4>
                                        <p className="text-xs text-success">Just completed a stake!</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
