"use client";

import { useState } from "react";
import TodoTimer from "@/components/todos/TodoTimer";
import PomodoroTimer from "@/components/todos/PomodoroTimer";
import DateTimePicker from "@/components/todos/DateTimePicker";
import { useNotifications } from "@/hooks/useNotifications";

export default function TimerDemoPage() {
    const [currentTimeSpent, setCurrentTimeSpent] = useState(0);
    const [sessionData, setSessionData] = useState<any>(null);
    const [dateTimeValue, setDateTimeValue] = useState<{
        date?: string;
        startTime?: string;
        endTime?: string;
        timeZone?: string;
    }>({
        date: "",
        startTime: "",
        endTime: "",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const {
        canNotify,
        permission,
        requestPermission,
        showTimerNotification,
        showPomodoroNotification
    } = useNotifications();

    const handleTimeUpdate = (timeSpent: number) => {
        setCurrentTimeSpent(timeSpent);
    };

    const handleSessionComplete = (data: any) => {
        setSessionData(data);
        console.log("Session completed:", data);
    };

    const handlePomodoroSessionComplete = (data: any) => {
        setSessionData(data);
        console.log("Pomodoro session completed:", data);
    };

    const testNotification = async (type: 'timer' | 'pomodoro') => {
        if (type === 'timer') {
            await showTimerNotification('complete', 'Demo Task');
        } else {
            await showPomodoroNotification('focus-end');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🕐 Timer & Scheduling Demo
                    </h1>
                    <p className="text-lg text-gray-600">
                        Experience the enhanced Todo system with advanced timer and scheduling features
                    </p>
                </div>

                {/* Notification Status */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">🔔 Notification Status</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Status: <span className={`font-medium ${canNotify ? 'text-green-600' : 'text-red-600'}`}>
                                    {canNotify ? 'Enabled' : 'Disabled'}
                                </span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Permission: {permission}
                            </p>
                        </div>
                        <div className="space-x-3">
                            {!canNotify && (
                                <button
                                    onClick={requestPermission}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Enable Notifications
                                </button>
                            )}
                            <button
                                onClick={() => testNotification('timer')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Test Timer Notification
                            </button>
                            <button
                                onClick={() => testNotification('pomodoro')}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Test Pomodoro Notification
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Todo Timer Demo */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900">⏱️ Todo Timer</h2>
                        <TodoTimer
                            todoId="demo-timer"
                            initialTimeSpent={currentTimeSpent}
                            estimatedDuration={30}
                            onTimeUpdate={handleTimeUpdate}
                            onSessionComplete={handleSessionComplete}
                            isFocusMode={true}
                        />
                    </div>

                    {/* Pomodoro Timer Demo */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900">🍅 Pomodoro Timer</h2>
                        <PomodoroTimer
                            todoId="demo-pomodoro"
                            onSessionComplete={handlePomodoroSessionComplete}
                        />
                    </div>
                </div>

                {/* DateTime Picker Demo */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">📅 Date & Time Picker</h2>
                    <div className="bg-white rounded-lg shadow p-6">
                        <DateTimePicker
                            value={dateTimeValue}
                            onChange={setDateTimeValue}
                            showEndTime={true}
                            showTimeZone={true}
                        />
                    </div>
                </div>

                {/* Session Data Display */}
                {sessionData && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📊 Session Data</h2>
                        <div className="bg-white rounded-lg shadow p-6">
                            <pre className="text-sm text-gray-600 overflow-auto">
                                {JSON.stringify(sessionData, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Features Overview */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">✨ New Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">⏱️ Timer Features</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Start/Pause/Stop/Reset controls</li>
                                <li>• Real-time time tracking</li>
                                <li>• Session notes and history</li>
                                <li>• Progress visualization</li>
                                <li>• Focus mode support</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Scheduling</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Date and time selection</li>
                                <li>• Timezone support</li>
                                <li>• Duration estimation</li>
                                <li>• Quick time selection</li>
                                <li>• Start/end time scheduling</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">🍅 Pomodoro</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• 25/5/15 minute cycles</li>
                                <li>• Customizable times</li>
                                <li>• Session tracking</li>
                                <li>• Visual progress indicators</li>
                                <li>• Break management</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔄 Recurring</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Daily, weekly, monthly patterns</li>
                                <li>• Automatic generation</li>
                                <li>• Smart scheduling</li>
                                <li>• Custom patterns</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔔 Notifications</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Timer start/stop alerts</li>
                                <li>• Pomodoro cycle notifications</li>
                                <li>• Due date reminders</li>
                                <li>• Achievement alerts</li>
                                <li>• Browser integration</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Analytics</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>• Time tracking statistics</li>
                                <li>• Session history</li>
                                <li>• Productivity insights</li>
                                <li>• Progress monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">📖 How to Use</h2>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Creating Enhanced Todos</h3>
                                <p className="text-gray-600">
                                    When creating a new todo, you can now set specific start/end times,
                                    estimated duration, timezone, and recurring patterns.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Using Timers</h3>
                                <p className="text-gray-600">
                                    Click the timer icon on any todo to start tracking time. Use the Pomodoro
                                    timer for structured work sessions with breaks.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Notifications</h3>
                                <p className="text-gray-600">
                                    Enable browser notifications to receive alerts for timer events,
                                    due dates, and achievements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
