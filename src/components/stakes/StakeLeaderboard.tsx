"use client";

import { useState, useEffect } from "react";
import {
    TrophyIcon,
    FireIcon,
    StarIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    UserGroupIcon,
    TrendingUpIcon
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
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-500">
                    <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No leaderboard data available</p>
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
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-purple-100">
                            <UserGroupIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{data.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100">
                            <TrophyIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Stakes</p>
                            <p className="text-2xl font-semibold text-gray-900">{data.totalStakes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-yellow-100">
                            <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Earned</p>
                            <p className="text-2xl font-semibold text-gray-900">Gh{data.totalEarned.toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
                            {getTabTitle()}
                        </h3>

                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('earners')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'earners'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Earners
                            </button>
                            <button
                                onClick={() => setActiveTab('performers')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'performers'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Performers
                            </button>
                            <button
                                onClick={() => setActiveTab('streaks')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'streaks'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Streaks
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {getCurrentLeaderboard().map((user, index) => (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${user.isCurrentUser
                                        ? 'bg-purple-50 border-2 border-purple-200'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {getRankIcon(user.rank)}
                                    </div>

                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-semibold text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-900">{user.name}</h4>
                                            {user.isCurrentUser && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>{user.totalStakes} stakes</span>
                                            <span>{user.successRate}% success</span>
                                            {activeTab === 'streaks' ? (
                                                <span className="flex items-center">
                                                    <FireIcon className="h-4 w-4 mr-1 text-orange-500" />
                                                    {user.currentStreak} streak
                                                </span>
                                            ) : (
                                                <span>Gh{user.totalEarned.toFixed(0)} earned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center space-x-1">
                                    {user.badges.slice(0, 3).map((badge, badgeIndex) => (
                                        <div
                                            key={badgeIndex}
                                            className="p-1 bg-white rounded-full shadow-sm"
                                            title={badge.replace('_', ' ')}
                                        >
                                            {getBadgeIcon(badge)}
                                        </div>
                                    ))}
                                    {user.badges.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{user.badges.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Winners */}
            {data.recentWinners.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
                        Recent Winners
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.recentWinners.map((winner) => (
                            <div key={winner.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-semibold text-sm">
                                            {winner.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{winner.name}</h4>
                                        <p className="text-sm text-green-600">Just completed a stake!</p>
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
