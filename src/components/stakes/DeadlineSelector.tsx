"use client";

import { useState } from "react";
import {
    getDeadlineFromHours,
    getDeadlineFromDays,
    formatDeadlineFromUTC,
    getMinDeadlineString,
    getMaxDeadlineString,
    formatDeadlineForDisplay,
} from "@/lib/timezone-utils";

interface DeadlineSelectorProps {
    value: string;
    onChange: (deadline: string) => void;
    error?: string;
}

/**
 * Deadline preset options
 * Common intervals users might want
 */
const DEADLINE_PRESETS = [
    { label: "1 Hour", hours: 1 },
    { label: "6 Hours", hours: 6 },
    { label: "12 Hours", hours: 12 },
    { label: "1 Day", days: 1 },
    { label: "3 Days", days: 3 },
    { label: "1 Week", days: 7 },
    { label: "2 Weeks", days: 14 },
    { label: "1 Month", days: 30 },
] as const;

export default function DeadlineSelector({ value, onChange, error }: DeadlineSelectorProps) {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [showCustom, setShowCustom] = useState(false);

    const handlePresetClick = (preset: typeof DEADLINE_PRESETS[number]) => {
        let deadline: Date;
        
        if ('hours' in preset) {
            deadline = getDeadlineFromHours(preset.hours);
        } else {
            deadline = getDeadlineFromDays(preset.days!);
        }

        const deadlineString = formatDeadlineFromUTC(deadline);
        onChange(deadlineString);
        setSelectedPreset(preset.label);
        setShowCustom(false);
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setSelectedPreset(null);
        if (e.target.value) {
            setShowCustom(true);
        }
    };

    const handleCustomToggle = () => {
        setShowCustom(!showCustom);
        if (!showCustom && !value) {
            // Set default to 1 hour from now when opening custom
            const defaultDeadline = formatDeadlineFromUTC(getDeadlineFromHours(1));
            onChange(defaultDeadline);
        }
    };

    // Check if current value matches any preset (with tolerance for rounding)
    const getCurrentPreset = () => {
        if (!value) return null;
        
        try {
            const currentDate = new Date(value);
            const now = new Date();
            const diffMs = currentDate.getTime() - now.getTime();
            const diffHours = Math.round(diffMs / (1000 * 60 * 60)); // Round to nearest hour
            const diffDays = Math.round(diffHours / 24); // Round to nearest day

            // Check presets with tolerance (±1 hour for hour-based, ±0.5 day for day-based)
            for (const preset of DEADLINE_PRESETS) {
                if ('hours' in preset) {
                    // Match if within 1 hour
                    if (Math.abs(preset.hours - diffHours) <= 1) {
                        return preset.label;
                    }
                }
                if ('days' in preset) {
                    // Match if within 0.5 days (12 hours)
                    const presetHours = preset.days! * 24;
                    if (Math.abs(presetHours - diffHours) <= 12) {
                        return preset.label;
                    }
                }
            }
        } catch (e) {
            // Invalid date, ignore
        }
        
        return null;
    };

    const currentPreset = getCurrentPreset() || selectedPreset;

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
            </label>

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEADLINE_PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                            currentPreset === preset.label
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Custom Date/Time Input */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleCustomToggle}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                        {showCustom ? 'Hide' : 'Set'} Custom Date & Time
                    </button>
                    {value && (
                        <span className="text-xs text-muted-foreground">
                            {(() => {
                                try {
                                    return formatDeadlineForDisplay(new Date(value));
                                } catch {
                                    return '';
                                }
                            })()}
                        </span>
                    )}
                </div>

                {showCustom && (
                    <input
                        type="datetime-local"
                        value={value}
                        onChange={handleCustomChange}
                        min={getMinDeadlineString(1)}
                        max={getMaxDeadlineString(90)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            error ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}

            {value && !error && (
                <p className="text-xs text-muted-foreground">
                    Deadline: {new Date(value).toLocaleString()}
                </p>
            )}
        </div>
    );
}

