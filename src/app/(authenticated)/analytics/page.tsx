"use client";

import { useState } from "react";
import ProductivityChart from "@/components/analytics/ProductivityChart";
import PatternAnalysis from "@/components/analytics/PatternAnalysis";
import ExportButton from "@/components/analytics/ExportButton";

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'productivity' | 'patterns'>('productivity');
    const [period, setPeriod] = useState('30');

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
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'productivity' && <ProductivityChart />}
                    {activeTab === 'patterns' && <PatternAnalysis />}
                </div>
            </div>
        </div>
    );
}
