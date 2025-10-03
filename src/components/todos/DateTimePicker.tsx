"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

interface DateTimePickerProps {
    value?: {
        date?: string;
        startTime?: string;
        endTime?: string;
        timeZone?: string;
    };
    onChange: (value: {
        date?: string;
        startTime?: string;
        endTime?: string;
        timeZone?: string;
    }) => void;
    showEndTime?: boolean;
    showTimeZone?: boolean;
    className?: string;
}

const TIMEZONES = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "UTC", label: "UTC" },
];

const QUICK_TIMES = [
    { label: "Now", value: "now" },
    { label: "In 15 min", value: "15min" },
    { label: "In 30 min", value: "30min" },
    { label: "In 1 hour", value: "1hour" },
    { label: "In 2 hours", value: "2hours" },
    { label: "Tomorrow 9 AM", value: "tomorrow9am" },
    { label: "Tomorrow 2 PM", value: "tomorrow2pm" },
];

export default function DateTimePicker({
    value = {},
    onChange,
    showEndTime = false,
    showTimeZone = true,
    className = ""
}: DateTimePickerProps) {
    const [localValue, setLocalValue] = useState({
        date: value.date || "",
        startTime: value.startTime || "",
        endTime: value.endTime || "",
        timeZone: value.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const [showQuickTimes, setShowQuickTimes] = useState(false);

    // Update parent when local value changes
    useEffect(() => {
        onChange(localValue);
    }, [localValue, onChange]);

    // Handle quick time selection
    const handleQuickTime = (quickTime: string) => {
        const now = new Date();
        let newDate = localValue.date;
        let newStartTime = localValue.startTime;
        let newEndTime = localValue.endTime;

        switch (quickTime) {
            case "now":
                newDate = now.toISOString().split('T')[0];
                newStartTime = now.toTimeString().slice(0, 5);
                break;
            case "15min":
                const in15Min = new Date(now.getTime() + 15 * 60000);
                newDate = in15Min.toISOString().split('T')[0];
                newStartTime = in15Min.toTimeString().slice(0, 5);
                break;
            case "30min":
                const in30Min = new Date(now.getTime() + 30 * 60000);
                newDate = in30Min.toISOString().split('T')[0];
                newStartTime = in30Min.toTimeString().slice(0, 5);
                break;
            case "1hour":
                const in1Hour = new Date(now.getTime() + 60 * 60000);
                newDate = in1Hour.toISOString().split('T')[0];
                newStartTime = in1Hour.toTimeString().slice(0, 5);
                break;
            case "2hours":
                const in2Hours = new Date(now.getTime() + 120 * 60000);
                newDate = in2Hours.toISOString().split('T')[0];
                newStartTime = in2Hours.toTimeString().slice(0, 5);
                break;
            case "tomorrow9am":
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
                newDate = tomorrow.toISOString().split('T')[0];
                newStartTime = "09:00";
                break;
            case "tomorrow2pm":
                const tomorrow2pm = new Date(now.getTime() + 24 * 60 * 60000);
                newDate = tomorrow2pm.toISOString().split('T')[0];
                newStartTime = "14:00";
                break;
        }

        setLocalValue(prev => ({
            ...prev,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
        }));
        setShowQuickTimes(false);
    };

    // Calculate duration between start and end time
    const calculateDuration = () => {
        if (!localValue.startTime || !localValue.endTime) return null;

        const start = new Date(`2000-01-01T${localValue.startTime}`);
        const end = new Date(`2000-01-01T${localValue.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));

        if (diffMinutes <= 0) return null;

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const duration = calculateDuration();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Quick Time Selection */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowQuickTimes(!showQuickTimes)}
                    className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Quick Select
                </button>

                {showQuickTimes && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="p-2">
                            <div className="grid grid-cols-2 gap-1">
                                {QUICK_TIMES.map((quickTime) => (
                                    <button
                                        key={quickTime.value}
                                        type="button"
                                        onClick={() => handleQuickTime(quickTime.value)}
                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        {quickTime.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Date Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Date
                </label>
                <input
                    type="date"
                    value={localValue.date}
                    onChange={(e) => setLocalValue(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Start Time
                    </label>
                    <input
                        type="time"
                        value={localValue.startTime}
                        onChange={(e) => setLocalValue(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {showEndTime && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <ClockIcon className="w-4 h-4 inline mr-1" />
                            End Time
                        </label>
                        <input
                            type="time"
                            value={localValue.endTime}
                            onChange={(e) => setLocalValue(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}
            </div>

            {/* Duration Display */}
            {showEndTime && duration && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <strong>Duration:</strong> {duration}
                </div>
            )}

            {/* Timezone Selection */}
            {showTimeZone && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                        Timezone
                    </label>
                    <select
                        value={localValue.timeZone}
                        onChange={(e) => setLocalValue(prev => ({ ...prev, timeZone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Current Time Display */}
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <strong>Current time:</strong> {new Date().toLocaleString('en-US', {
                    timeZone: localValue.timeZone,
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </div>
        </div>
    );
}
