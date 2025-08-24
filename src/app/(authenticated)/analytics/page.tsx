"use client";

import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Analytics</h1>
                <p className="text-indigo-100">Track your productivity patterns and insights</p>
            </div>

            {/* Analytics Content */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500 mb-4">
                    Comprehensive analytics and insights are coming soon!
                </p>
                <p className="text-sm text-gray-400">
                    This feature will provide detailed charts, productivity trends,
                    time analysis, and AI-powered insights to help you optimize your workflow.
                </p>
            </div>
        </div>
    );
}
