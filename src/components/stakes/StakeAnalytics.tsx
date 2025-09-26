"use client";

import { useState, useEffect } from "react";
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";

interface StakeAnalyticsData {
    totalStakes: number;
    activeStakes: number;
    completedStakes: number;
    failedStakes: number;
    totalEarned: number;
    totalLost: number;
    successRate: number;
    averageStakeAmount: number;
    totalParticipants: number;
    monthlyData: Array<{
        month: string;
        completed: number;
        failed: number;
        earned: number;
    }>;
    stakeTypeBreakdown: Array<{
        type: string;
        count: number;
        successRate: number;
    }>;
    recentActivity: Array<{
        id: string;
        title: string;
        status: string;
        amount: number;
        date: string;
    }>;
}

interface StakeAnalyticsProps {
    userId: string;
}

export default function StakeAnalytics({ userId }: StakeAnalyticsProps) {
    const [data, setData] = useState<StakeAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [userId, timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics/stakes?userId=${userId}&timeRange=${timeRange}`);
            if (response.ok) {
                const analyticsData = await response.json();
                setData(analyticsData);
            }
        } catch (error) {
            console.error('Error fetching stake analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No analytics data available</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            name: 'Total Stakes',
            value: data.totalStakes,
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Success Rate',
            value: `${data.successRate}%`,
            icon: ArrowTrendingUpIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            name: 'Total Earned',
            value: `Gh${data.totalEarned.toFixed(2)}`,
            icon: CurrencyDollarIcon,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
        {
            name: 'Active Stakes',
            value: data.activeStakes,
            icon: ClockIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Stake Analytics</h2>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completion Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Overview</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm text-gray-600">Completed</span>
                            </div>
                            <span className="font-semibold text-green-600">{data.completedStakes}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                                <span className="text-sm text-gray-600">Failed</span>
                            </div>
                            <span className="font-semibold text-red-600">{data.failedStakes}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="text-sm text-gray-600">Active</span>
                            </div>
                            <span className="font-semibold text-blue-600">{data.activeStakes}</span>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Earned</span>
                            <span className="font-semibold text-green-600">Gh{data.totalEarned.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Lost</span>
                            <span className="font-semibold text-red-600">Gh{data.totalLost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Net Profit</span>
                            <span className={`font-semibold ${data.totalEarned - data.totalLost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Gh{(data.totalEarned - data.totalLost).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Average Stake</span>
                            <span className="font-semibold text-gray-900">Gh{data.averageStakeAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {data.recentActivity.length > 0 ? (
                        data.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${activity.status === 'COMPLETED' ? 'bg-green-500' :
                                        activity.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">Gh{activity.amount.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 capitalize">{activity.status.toLowerCase()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
}
