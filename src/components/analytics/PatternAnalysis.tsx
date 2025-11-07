"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';
import { usePatternAnalytics } from '@/hooks/useData';
import { ClockIcon, CalendarIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { validatePatternData, type PatternData } from '@/lib/analytics-validator';

export default function PatternAnalysis() {
    const [period, setPeriod] = useState('30');

    // Use enhanced hook with caching and real-time updates
    const { data = null, isLoading: loading, refreshAnalytics } = usePatternAnalytics(period);

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

    // Validate and normalize data
    const safeData = data ? validatePatternData(data) : null;

    if (!safeData) {
        return (
            <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-8 border border-border/50 shadow-lg text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Discover Your Patterns</h3>
                    <p className="text-muted-foreground mb-6">
                        Track your task completion patterns to understand when you're most productive and how to optimize your workflow.
                    </p>
                    <div className="text-sm text-muted-foreground">
                        💡 <strong>Insight:</strong> Most people are 2x more productive during their peak hours. Find yours!
                    </div>
                </div>
            </div>
        );
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-destructive bg-destructive/20 border-destructive/30';
            case 'MEDIUM': return 'text-warning bg-warning/20 border-warning/30';
            case 'LOW': return 'text-success bg-success/20 border-success/30';
            default: return 'text-muted-foreground bg-muted/20 border-muted/30';
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
            case 'high': return 'border-destructive/30 bg-destructive/10';
            case 'medium': return 'border-warning/30 bg-warning/10';
            case 'low': return 'border-success/30 bg-success/10';
            default: return 'border-border bg-card/50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Pattern Analysis</h2>
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

            {/* Productivity Score */}
            <div className="backdrop-blur-sm bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 sm:p-8 rounded-2xl text-primary-foreground shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Productivity Score</h3>
                        <p className="text-primary-foreground/80 text-sm sm:text-base">Based on completion rate and daily activity</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className="text-3xl sm:text-4xl font-bold tabular-nums">{safeData.productivityScore}</div>
                        <div className="text-primary-foreground/80 text-sm">out of 100</div>
                    </div>
                </div>
                <div className="mt-4 w-full bg-primary-foreground/20 rounded-full h-2">
                    <div
                        className="bg-primary-foreground h-2 rounded-full transition-all duration-500"
                        style={{ width: `${safeData.productivityScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Insights */}
            {safeData.insights.length > 0 && (
                <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">AI Insights</h3>
                    <div className="space-y-3">
                        {safeData.insights.map((insight: any, index: number) => (
                            <div
                                key={index}
                                className={`p-4 rounded-2xl border-l-4 shadow-sm ${getInsightPriorityColor(insight.priority || 'medium')}`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-3 mt-0.5 text-muted-foreground">
                                        {getInsightIcon(insight.type)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Peak Hours Chart */}
                <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Peak Productivity Hours</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={safeData.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip />
                            <Bar dataKey="completed" fill="hsl(var(--primary))" name="Tasks Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Day of Week Patterns */}
                <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Day of Week Patterns</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={safeData.dayPatterns}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="dayName" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip />
                            <Bar dataKey="completed" fill="hsl(var(--success))" name="Tasks Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Most Productive Day */}
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Most Productive Day</h3>
                <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-2 tabular-nums">
                        {safeData.mostProductiveDay.dayName}
                    </div>
                    <p className="text-muted-foreground">
                        Your most productive day of the week
                    </p>
                </div>
            </div>

            {/* Priority Patterns */}
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Priority Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {safeData.priorityPatterns.map((pattern) => (
                        <div key={pattern.priority} className="p-4 rounded-2xl border border-border/50 bg-card/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(pattern.priority)}`}>
                                    {pattern.priority}
                                </span>
                                <span className="text-2xl font-bold text-foreground tabular-nums">{pattern.count}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Avg. points: {(pattern.avgPoints || 0).toFixed(1)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completion Time Analysis */}
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Task Completion Time Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {safeData.completionTimeRanges?.length > 0 ? (
                        safeData.completionTimeRanges.map((range, index) => (
                            <div key={index} className="text-center p-4 bg-card/30 rounded-2xl border border-border/50">
                                <div className="text-2xl font-bold text-primary tabular-nums">{range.count || 0}</div>
                                <div className="text-sm text-muted-foreground">{range.range || 'N/A'}</div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-4">
                            No completion time data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
