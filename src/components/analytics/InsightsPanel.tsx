"use client";

import { useState } from 'react';
import {
    LightBulbIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Insight {
    id: string;
    type: 'success' | 'warning' | 'info' | 'tip';
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    priority: 'high' | 'medium' | 'low';
}

interface InsightsPanelProps {
    insights: Insight[];
    onDismiss?: (insightId: string) => void;
}

export default function InsightsPanel({ insights, onDismiss }: InsightsPanelProps) {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const handleDismiss = (insightId: string) => {
        setDismissed(prev => new Set([...prev, insightId]));
        onDismiss?.(insightId);
    };

    const visibleInsights = insights.filter(insight => !dismissed.has(insight.id));

    if (visibleInsights.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
                <p className="text-gray-600">
                    No specific insights or recommendations at this time. Keep up the great work!
                </p>
            </div>
        );
    }

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <ChartBarIcon className="w-5 h-5 text-blue-500" />;
            case 'tip':
                return <LightBulbIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <LightBulbIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'info':
                return 'border-blue-200 bg-blue-50';
            case 'tip':
                return 'border-purple-200 bg-purple-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <span>{visibleInsights.length} insights</span>
                </div>
            </div>

            <div className="space-y-3">
                {visibleInsights.map((insight) => (
                    <div
                        key={insight.id}
                        className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getInsightIcon(insight.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                            {insight.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

                                    {insight.action && (
                                        <button
                                            onClick={insight.action.onClick}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {insight.action.label} →
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDismiss(insight.id)}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Dismiss insight"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {dismissed.size > 0 && (
                <div className="text-center">
                    <button
                        onClick={() => setDismissed(new Set())}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Show dismissed insights ({dismissed.size})
                    </button>
                </div>
            )}
        </div>
    );
}
