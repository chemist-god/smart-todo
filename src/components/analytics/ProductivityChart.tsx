"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';
import { useProductivityAnalytics } from '@/hooks/useData';

interface ProductivityData {
    period: string;
    dailyStats: Array<{
        date: string;
        completed: number;
        created: number;
        completionRate: number;
    }>;
    weeklyStats: Array<{
        week: string;
        completed: number;
        created: number;
        completionRate: number;
    }>;
    priorityBreakdown: Array<{
        priority: string;
        count: number;
    }>;
    totalPointsEarned: number;
    avgCompletionTime: number;
    totalCompleted: number;
    totalCreated: number;
    overallCompletionRate: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ProductivityChart() {
    const [period, setPeriod] = useState('30');

    // Use enhanced hook with caching and real-time updates
    const { data, isLoading: loading, refreshAnalytics } = useProductivityAnalytics(period);

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

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Productivity Analytics</h2>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Completion Rate</div>
                    <div className="text-2xl font-bold">{data.overallCompletionRate.toFixed(1)}%</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Tasks Completed</div>
                    <div className="text-2xl font-bold">{data.totalCompleted}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Points Earned</div>
                    <div className="text-2xl font-bold">{data.totalPointsEarned}</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Avg. Completion Time</div>
                    <div className="text-2xl font-bold">{data.avgCompletionTime}h</div>
                </div>
            </div>

            {/* Daily Completion Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Completion Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        />
                        <Line
                            type="monotone"
                            dataKey="completed"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            name="Completed"
                        />
                        <Line
                            type="monotone"
                            dataKey="created"
                            stroke="#10B981"
                            strokeWidth={2}
                            name="Created"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Weekly Completion Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Completion Rates</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completionRate" fill="#8B5CF6" name="Completion Rate (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.priorityBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ priority, count }) => `${priority}: ${count}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {data.priorityBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        {data.priorityBreakdown.map((item, index) => (
                            <div key={item.priority} className="flex items-center mb-3">
                                <div
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span className="text-sm text-gray-600 capitalize">{item.priority.toLowerCase()}</span>
                                <span className="ml-auto font-semibold">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
