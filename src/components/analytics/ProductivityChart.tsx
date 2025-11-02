"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';
import { useProductivityAnalytics } from '@/hooks/useData';
import { validateProductivityData, generateMockProductivityData, type ProductivityData as ValidatedProductivityData } from '@/lib/analytics-validator';

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
    const { data = null, isLoading: loading, refreshAnalytics } = useProductivityAnalytics(period);

    if (loading) {
        return (
            <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-muted rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-6 border border-border/50 shadow-lg text-center">
                <p className="text-muted-foreground">No data available for the selected period.</p>
            </div>
        );
    }

    // Validate and normalize data with fallbacks
    const safeData = data ? validateProductivityData(data) : generateMockProductivityData();

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Productivity Analytics</h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-3 py-2 border border-border rounded-2xl bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="backdrop-blur-sm bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-4 sm:p-5 rounded-2xl text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-sm opacity-90">Completion Rate</div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{safeData.overallCompletionRate.toFixed(1)}%</div>
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-success via-success/90 to-success/80 p-4 sm:p-5 rounded-2xl text-success-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-sm opacity-90">Tasks Completed</div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{safeData.totalCompleted}</div>
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 p-4 sm:p-5 rounded-2xl text-secondary-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-sm opacity-90">Points Earned</div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{safeData.totalPointsEarned}</div>
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-info via-info/90 to-info/80 p-4 sm:p-5 rounded-2xl text-info-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="text-sm opacity-90">Avg. Completion Time</div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums">{safeData.avgCompletionTime.toFixed(1)}h</div>
                </div>
            </div>

            {/* Daily Completion Chart */}
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Daily Completion Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={safeData.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
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
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Completed"
                        />
                        <Line
                            type="monotone"
                            dataKey="created"
                            stroke="hsl(var(--success))"
                            strokeWidth={2}
                            name="Created"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Weekly Completion Chart */}
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Weekly Completion Rates</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={safeData.weeklyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed Tasks" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Priority Breakdown */}
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Tasks by Priority</h3>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={safeData.priorityBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ priority, count }) => `${priority}: ${count}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {safeData.priorityBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        {safeData.priorityBreakdown.map((item, index) => (
                            <div key={item.priority} className="flex items-center mb-3">
                                <div
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span className="text-sm text-muted-foreground capitalize">{item.priority.toLowerCase()}</span>
                                <span className="ml-auto font-semibold tabular-nums">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
