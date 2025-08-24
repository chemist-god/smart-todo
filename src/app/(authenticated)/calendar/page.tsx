"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

export default function CalendarPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Calendar</h1>
                <p className="text-green-100">View your tasks and deadlines in a calendar view</p>
            </div>

            {/* Calendar Content */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-500 mb-4">
                    A comprehensive calendar view of your todos and deadlines is coming soon!
                </p>
                <p className="text-sm text-gray-400">
                    This feature will allow you to see all your tasks organized by date,
                    with visual indicators for priorities and completion status.
                </p>
            </div>
        </div>
    );
}
