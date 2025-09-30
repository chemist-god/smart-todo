"use client";

import { useState, useEffect, useRef } from "react";
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    ClockIcon,
    CheckIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useNotifications } from "@/hooks/useNotifications";

interface TodoTimerProps {
    todoId: string;
    initialTimeSpent: number;
    estimatedDuration?: number;
    onTimeUpdate: (timeSpent: number) => void;
    onSessionComplete: (sessionData: TimerSessionData) => void;
    isFocusMode?: boolean;
    className?: string;
}

interface TimerSessionData {
    duration: number;
    sessionType: 'FOCUS' | 'BREAK' | 'POMODORO' | 'DEEP_WORK' | 'REVIEW';
    notes?: string;
}

export default function TodoTimer({
    todoId,
    initialTimeSpent,
    estimatedDuration,
    onTimeUpdate,
    onSessionComplete,
    isFocusMode = false,
    className = ""
}: TodoTimerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSessionTime, setCurrentSessionTime] = useState(0);
    const [totalTimeSpent, setTotalTimeSpent] = useState(initialTimeSpent);
    const [sessionNotes, setSessionNotes] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [todoTitle, setTodoTitle] = useState("Task");

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<Date | null>(null);
    const { showTimerNotification } = useNotifications();

    // Format time in MM:SS or HH:MM:SS
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const progressPercentage = estimatedDuration
        ? Math.min((totalTimeSpent / estimatedDuration) * 100, 100)
        : 0;

    // Start timer
    const startTimer = async () => {
        if (!isRunning) {
            setIsRunning(true);
            setIsPaused(false);
            startTimeRef.current = new Date();

            // Show notification
            await showTimerNotification('start', todoTitle);

            intervalRef.current = setInterval(() => {
                setCurrentSessionTime(prev => {
                    const newTime = prev + 1;
                    const newTotal = totalTimeSpent + newTime;
                    setTotalTimeSpent(newTotal);
                    onTimeUpdate(newTotal);
                    return newTime;
                });
            }, 1000);
        }
    };

    // Pause timer
    const pauseTimer = async () => {
        if (isRunning && !isPaused) {
            setIsPaused(true);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Show notification
            await showTimerNotification('pause', todoTitle);
        }
    };

    // Resume timer
    const resumeTimer = () => {
        if (isRunning && isPaused) {
            setIsPaused(false);
            startTimeRef.current = new Date();

            intervalRef.current = setInterval(() => {
                setCurrentSessionTime(prev => {
                    const newTime = prev + 1;
                    const newTotal = totalTimeSpent + newTime;
                    setTotalTimeSpent(newTotal);
                    onTimeUpdate(newTotal);
                    return newTime;
                });
            }, 1000);
        }
    };

    // Stop timer
    const stopTimer = async () => {
        setIsRunning(false);
        setIsPaused(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Save session data
        if (currentSessionTime > 0) {
            const sessionData: TimerSessionData = {
                duration: currentSessionTime,
                sessionType: isFocusMode ? 'DEEP_WORK' : 'FOCUS',
                notes: sessionNotes || undefined
            };
            onSessionComplete(sessionData);

            // Show completion notification
            await showTimerNotification('complete', todoTitle);
        } else {
            // Show stop notification
            await showTimerNotification('stop', todoTitle);
        }

        setCurrentSessionTime(0);
        setSessionNotes("");
        setShowNotes(false);
        startTimeRef.current = null;
    };

    // Reset timer
    const resetTimer = () => {
        stopTimer();
        setCurrentSessionTime(0);
        setTotalTimeSpent(initialTimeSpent);
        onTimeUpdate(initialTimeSpent);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className={`bg-white border rounded-lg p-4 ${className}`}>
            {/* Timer Display */}
            <div className="text-center mb-4">
                <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                    {formatTime(currentSessionTime)}
                </div>
                <div className="text-sm text-gray-500">
                    Session Time
                </div>
                <div className="text-lg font-semibold text-blue-600 mt-2">
                    Total: {formatTime(totalTimeSpent * 60)}
                </div>
            </div>

            {/* Progress Bar */}
            {estimatedDuration && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {estimatedDuration - totalTimeSpent > 0
                            ? `${estimatedDuration - totalTimeSpent} min remaining`
                            : 'Time exceeded'
                        }
                    </div>
                </div>
            )}

            {/* Timer Controls */}
            <div className="flex justify-center space-x-2 mb-4">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Start
                    </button>
                ) : isPaused ? (
                    <button
                        onClick={resumeTimer}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Resume
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                        <PauseIcon className="w-4 h-4 mr-2" />
                        Pause
                    </button>
                )}

                {isRunning && (
                    <button
                        onClick={stopTimer}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <StopIcon className="w-4 h-4 mr-2" />
                        Stop
                    </button>
                )}

                <button
                    onClick={resetTimer}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Reset
                </button>
            </div>

            {/* Session Notes */}
            <div className="border-t pt-4">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {showNotes ? 'Hide' : 'Add'} Session Notes
                </button>

                {showNotes && (
                    <textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        placeholder="Add notes about this session..."
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows={2}
                    />
                )}
            </div>

            {/* Focus Mode Indicator */}
            {isFocusMode && (
                <div className="mt-3 flex items-center justify-center text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse" />
                    Focus Mode Active
                </div>
            )}
        </div>
    );
}
