"use client";

import { useState, useEffect, useRef } from "react";
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    CoffeeIcon
} from "@heroicons/react/24/outline";

interface PomodoroTimerProps {
    todoId: string;
    onSessionComplete: (sessionData: PomodoroSessionData) => void;
    className?: string;
}

interface PomodoroSessionData {
    type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
    duration: number;
    completedAt: Date;
}

type PomodoroPhase = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const DEFAULT_TIMES = {
    FOCUS: 25, // 25 minutes
    SHORT_BREAK: 5, // 5 minutes
    LONG_BREAK: 15, // 15 minutes
};

export default function PomodoroTimer({
    todoId,
    onSessionComplete,
    className = ""
}: PomodoroTimerProps) {
    const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>('FOCUS');
    const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.FOCUS * 60); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [customTimes, setCustomTimes] = useState(DEFAULT_TIMES);
    const [showSettings, setShowSettings] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio for notifications
    useEffect(() => {
        audioRef.current = new Audio();
        // You can add notification sounds here
    }, []);

    // Format time in MM:SS
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get phase-specific styling
    const getPhaseStyles = () => {
        switch (currentPhase) {
            case 'FOCUS':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    progressColor: 'bg-red-500',
                };
            case 'SHORT_BREAK':
                return {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-800',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                    progressColor: 'bg-green-500',
                };
            case 'LONG_BREAK':
                return {
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-800',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                    progressColor: 'bg-blue-500',
                };
        }
    };

    // Calculate progress percentage
    const getProgressPercentage = () => {
        const totalTime = customTimes[currentPhase] * 60;
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    // Start timer
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            setIsPaused(false);

            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Timer finished
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    // Pause timer
    const pauseTimer = () => {
        if (isRunning && !isPaused) {
            setIsPaused(true);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    };

    // Resume timer
    const resumeTimer = () => {
        if (isRunning && isPaused) {
            setIsPaused(false);

            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    // Stop timer
    const stopTimer = () => {
        setIsRunning(false);
        setIsPaused(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    // Reset timer
    const resetTimer = () => {
        stopTimer();
        setTimeLeft(customTimes[currentPhase] * 60);
    };

    // Handle timer completion
    const handleTimerComplete = () => {
        stopTimer();

        // Play notification sound
        if (audioRef.current) {
            audioRef.current.play().catch(console.error);
        }

        // Record session completion
        const sessionData: PomodoroSessionData = {
            type: currentPhase === 'FOCUS' ? 'FOCUS' :
                currentPhase === 'SHORT_BREAK' ? 'SHORT_BREAK' : 'LONG_BREAK',
            duration: customTimes[currentPhase],
            completedAt: new Date(),
        };

        onSessionComplete(sessionData);

        // Update completed sessions count
        if (currentPhase === 'FOCUS') {
            setCompletedSessions(prev => prev + 1);
        }

        // Move to next phase
        moveToNextPhase();
    };

    // Move to next phase
    const moveToNextPhase = () => {
        if (currentPhase === 'FOCUS') {
            // After focus, take a break
            const nextPhase = completedSessions > 0 && (completedSessions + 1) % 4 === 0
                ? 'LONG_BREAK'
                : 'SHORT_BREAK';
            setCurrentPhase(nextPhase);
            setTimeLeft(customTimes[nextPhase] * 60);
        } else {
            // After break, go back to focus
            setCurrentPhase('FOCUS');
            setTimeLeft(customTimes.FOCUS * 60);
        }
    };

    // Update custom times
    const updateCustomTime = (phase: PomodoroPhase, minutes: number) => {
        setCustomTimes(prev => ({
            ...prev,
            [phase]: minutes
        }));

        // If we're updating the current phase and timer is stopped, update time left
        if (phase === currentPhase && !isRunning) {
            setTimeLeft(minutes * 60);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const styles = getPhaseStyles();
    const progressPercentage = getProgressPercentage();

    return (
        <div className={`border rounded-lg p-6 ${styles.bgColor} ${styles.borderColor} ${className}`}>
            {/* Header */}
            <div className="text-center mb-6">
                <h3 className={`text-lg font-semibold ${styles.textColor} mb-2`}>
                    {currentPhase === 'FOCUS' && '🍅 Focus Time'}
                    {currentPhase === 'SHORT_BREAK' && '☕ Short Break'}
                    {currentPhase === 'LONG_BREAK' && '🌴 Long Break'}
                </h3>
                <div className="text-sm text-gray-600">
                    Session {completedSessions + 1} • {currentPhase === 'FOCUS' ? 'Focus' : 'Break'} Phase
                </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
                <div className={`text-6xl font-mono font-bold ${styles.textColor} mb-4`}>
                    {formatTime(timeLeft)}
                </div>

                {/* Progress Circle */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                            className={`${styles.progressColor} transition-all duration-1000`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-2xl font-bold ${styles.textColor}`}>
                            {Math.round(progressPercentage)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-3 mb-6">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        className={`flex items-center px-6 py-3 text-white rounded-lg font-medium transition-colors ${styles.buttonColor}`}
                    >
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Start
                    </button>
                ) : isPaused ? (
                    <button
                        onClick={resumeTimer}
                        className={`flex items-center px-6 py-3 text-white rounded-lg font-medium transition-colors ${styles.buttonColor}`}
                    >
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Resume
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                    >
                        <PauseIcon className="w-5 h-5 mr-2" />
                        Pause
                    </button>
                )}

                <button
                    onClick={stopTimer}
                    className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                    <StopIcon className="w-5 h-5 mr-2" />
                    Stop
                </button>

                <button
                    onClick={resetTimer}
                    className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                    <ArrowPathIcon className="w-5 h-5 mr-2" />
                    Reset
                </button>
            </div>

            {/* Settings */}
            <div className="border-t pt-4">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    ⚙️ Timer Settings
                </button>

                {showSettings && (
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Focus Time (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={customTimes.FOCUS}
                                onChange={(e) => updateCustomTime('FOCUS', parseInt(e.target.value) || 25)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Short Break (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={customTimes.SHORT_BREAK}
                                onChange={(e) => updateCustomTime('SHORT_BREAK', parseInt(e.target.value) || 5)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Long Break (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={customTimes.LONG_BREAK}
                                onChange={(e) => updateCustomTime('LONG_BREAK', parseInt(e.target.value) || 15)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Session Stats */}
            <div className="mt-4 text-center text-sm text-gray-600">
                <div className="flex justify-center space-x-4">
                    <span>✅ Completed: {completedSessions}</span>
                    <span>🍅 Focus Sessions</span>
                </div>
            </div>
        </div>
    );
}
