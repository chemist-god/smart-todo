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
            <div className="backdrop-blur-sm bg-card/50 p-6 rounded-2xl border border-border/50 shadow-lg text-center">
                <CheckCircleIcon className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">All Good!</h3>
                <p className="text-muted-foreground">
                    No specific insights or recommendations at this time. Keep up the great work!
                </p>
            </div>
        );
    }

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-success" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-warning" />;
            case 'info':
                return <ChartBarIcon className="w-5 h-5 text-info" />;
            case 'tip':
                return <LightBulbIcon className="w-5 h-5 text-secondary" />;
            default:
                return <LightBulbIcon className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-success/30 bg-success/10';
            case 'warning':
                return 'border-warning/30 bg-warning/10';
            case 'info':
                return 'border-info/30 bg-info/10';
            case 'tip':
                return 'border-secondary/30 bg-secondary/10';
            default:
                return 'border-border bg-card/50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-destructive bg-destructive/20 border-destructive/30';
            case 'medium':
                return 'text-warning bg-warning/20 border-warning/30';
            case 'low':
                return 'text-success bg-success/20 border-success/30';
            default:
                return 'text-muted-foreground bg-muted/20 border-muted/30';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">AI Insights</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <span className="tabular-nums">{visibleInsights.length} insights</span>
                </div>
            </div>

            <div className="space-y-3">
                {visibleInsights.map((insight) => (
                    <div
                        key={insight.id}
                        className={`backdrop-blur-sm p-4 sm:p-5 rounded-2xl border shadow-lg transition-all duration-200 hover:shadow-xl ${getInsightColor(insight.type)}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getInsightIcon(insight.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                        <h4 className="font-medium text-foreground">{insight.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border self-start ${getPriorityColor(insight.priority)}`}>
                                            {insight.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                                    {insight.action && (
                                        <button
                                            onClick={insight.action.onClick}
                                            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                        >
                                            {insight.action.label} →
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDismiss(insight.id)}
                                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-2"
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
                        className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
                    >
                        Show dismissed insights ({dismissed.size})
                    </button>
                </div>
            )}
        </div>
    );
}
