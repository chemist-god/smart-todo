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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
                        <p className="text-indigo-100">Track your productivity patterns and insights</p>
                    </div>
                    <ExportButton period={period} />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('productivity')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'productivity'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Productivity Metrics
                        </button>
                        <button
                            onClick={() => setActiveTab('patterns')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'patterns'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Pattern Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('goals')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'goals'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Goals Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'insights'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            AI Insights
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'productivity' && <ProductivityChart />}
                    {activeTab === 'patterns' && <PatternAnalysis />}
                    {activeTab === 'goals' && <GoalsOverview />}
                    {activeTab === 'insights' && <InsightsPanel insights={insights} />}
                </div>
            </div>
        </div>
    );
}
