"use client";

import { useState } from "react";
import ProductivityChart from "@/components/analytics/ProductivityChart";
import PatternAnalysis from "@/components/analytics/PatternAnalysis";
import GoalsOverview from "@/components/analytics/GoalsOverview";
import ExportButton from "@/components/analytics/ExportButton";
import InsightsPanel from "@/components/analytics/InsightsPanel";

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'productivity' | 'patterns' | 'goals' | 'insights'>('productivity');
    const [period, setPeriod] = useState('30');

    // Mock insights data - in a real app, this would come from an API
    const insights = [
        {
            id: '1',
            type: 'success' as const,
            title: 'Great Progress!',
            description: 'You\'ve completed 80% of your tasks this week. Keep up the excellent work!',
            priority: 'medium' as const,
        },
        {
            id: '2',
            type: 'tip' as const,
            title: 'Peak Productivity Time',
            description: 'You\'re most productive between 9-11 AM. Try scheduling your most important tasks during this time.',
            priority: 'high' as const,
            action: {
                label: 'Schedule Focus Time',
                onClick: () => console.log('Schedule focus time'),
            },
        },
        {
            id: '3',
            type: 'warning' as const,
            title: 'Goal Behind Schedule',
            description: 'Your "Complete Project" goal is 20% behind schedule. Consider adjusting your timeline or increasing effort.',
            priority: 'high' as const,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/20">
            <div className="backdrop-blur-sm bg-card/50 rounded-2xl p-4 sm:p-6 m-4 shadow-lg border border-border/50">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-4 sm:p-6 text-primary-foreground shadow-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold mb-2">Analytics Dashboard</h1>
                                <p className="text-primary-foreground/80 text-sm sm:text-base">Track your productivity patterns and insights</p>
                            </div>
                            <div className="w-full sm:w-auto">
                                <ExportButton period={period} />
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="backdrop-blur-sm bg-card/80 rounded-2xl border border-border/50 shadow-lg">
                        <div className="border-b border-border/50">
                            <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 px-4 sm:px-6">
                                <button
                                    onClick={() => setActiveTab('productivity')}
                                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'productivity'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                                >
                                    Productivity Metrics
                                </button>
                                <button
                                    onClick={() => setActiveTab('patterns')}
                                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'patterns'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                                >
                                    Pattern Analysis
                                </button>
                                <button
                                    onClick={() => setActiveTab('goals')}
                                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'goals'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                                >
                                    Goals Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'insights'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                                >
                                    AI Insights
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 sm:p-6">
                            {activeTab === 'productivity' && <ProductivityChart />}
                            {activeTab === 'patterns' && <PatternAnalysis />}
                            {activeTab === 'goals' && <GoalsOverview />}
                            {activeTab === 'insights' && <InsightsPanel insights={insights} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
