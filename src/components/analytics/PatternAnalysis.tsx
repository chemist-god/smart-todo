"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';
import { usePatternAnalytics } from '@/hooks/useData';
import { ClockIcon, CalendarIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface PatternData {
    period: string;
    peakHours: Array<{
        hour: number;
        time: string;
        completed: number;
        points: number;
    }>;
    dayPatterns: Array<{
        day: number;
        dayName: string;
        completed: number;
        points: number;
    }>;
    mostProductiveDay: {
        day: number;
        dayName: string;
        completed: number;
        points: number;
    };
    priorityPatterns: Array<{
        priority: string;
        count: number;
        avgPoints: number;
    }>;
    completionTimeRanges: {
        sameDay: number;
        withinWeek: number;
        withinMonth: number;
        overMonth: number;
    };
    productivityScore: number;
    insights: Array<{
        type: string;
        message: string;
        priority: string;
    }>;
    totalCompleted: number;
    totalCreated: number;
    completionRate: number;
}

export default function PatternAnalysis() {
    const [period, setPeriod] = useState('30');

    // Use enhanced hook with caching and real-time updates
    const { data, isLoading: loading, refreshAnalytics } = usePatternAnalytics(period);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                <p className="text-gray-500">No data available for the selected period.</p>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'LOW': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'peak_hour': return <ClockIcon className="w-5 h-5" />;
            case 'peak_day': return <CalendarIcon className="w-5 h-5" />;
            case 'completion_rate': return <ChartBarIcon className="w-5 h-5" />;
            case 'completion_time': return <ClockIcon className="w-5 h-5" />;
            default: return <LightBulbIcon className="w-5 h-5" />;
        }
    };

    const getInsightPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50';
            case 'medium': return 'border-yellow-200 bg-yellow-50';
            case 'low': return 'border-green-200 bg-green-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Pattern Analysis</h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>

            {/* Productivity Score */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Productivity Score</h3>
                        <p className="text-indigo-100">Based on completion rate and daily activity</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{data.productivityScore}</div>
                        <div className="text-indigo-100">out of 100</div>
                    </div>
                </div>
                <div className="mt-4 w-full bg-indigo-300 rounded-full h-2">
                    <div
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.productivityScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Insights */}
            {data.insights.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                    <div className="space-y-3">
                        {data.insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-l-4 ${getInsightPriorityColor(insight.priority)}`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-3 mt-0.5">
                                        {getInsightIcon(insight.type)}
                                    </div>
                                    <p className="text-sm text-gray-700">{insight.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Hours Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Productivity Hours</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="completed" fill="#3B82F6" name="Tasks Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Day of Week Patterns */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Day of Week Patterns</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.dayPatterns}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dayName" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="completed" fill="#10B981" name="Tasks Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Most Productive Day */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Productive Day</h3>
                <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                        {data.mostProductiveDay.dayName}
                    </div>
                    <p className="text-gray-600">
                        {data.mostProductiveDay.completed} tasks completed • {data.mostProductiveDay.points} points earned
                    </p>
                </div>
            </div>

            {/* Priority Patterns */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.priorityPatterns.map((pattern) => (
                        <div key={pattern.priority} className="p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(pattern.priority)}`}>
                                    {pattern.priority}
                                </span>
                                <span className="text-2xl font-bold text-gray-900">{pattern.count}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Avg. {pattern.avgPoints} points per task
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completion Time Analysis */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Time Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{data.completionTimeRanges.sameDay}</div>
                        <div className="text-sm text-green-600">Same Day</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{data.completionTimeRanges.withinWeek}</div>
                        <div className="text-sm text-blue-600">Within Week</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{data.completionTimeRanges.withinMonth}</div>
                        <div className="text-sm text-yellow-600">Within Month</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{data.completionTimeRanges.overMonth}</div>
                        <div className="text-sm text-red-600">Over Month</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
