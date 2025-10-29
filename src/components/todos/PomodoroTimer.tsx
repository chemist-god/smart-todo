"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    ArrowPathIcon,
    Cog6ToothIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ChartBarIcon,
    FireIcon
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

const PHASE_CONFIG = {
    FOCUS: {
        label: 'Focus Time',
        emoji: '🎯',
        description: 'Deep work session',
        gradient: 'from-primary/20 via-primary/10 to-primary/5',
        borderColor: 'border-primary/30',
        textColor: 'text-primary',
        buttonColor: 'bg-primary hover:bg-primary/90',
        progressColor: 'stroke-primary',
        bgAccent: 'bg-primary/5'
    },
    SHORT_BREAK: {
        label: 'Short Break',
        emoji: '☕',
        description: 'Quick refresh',
        gradient: 'from-success/20 via-success/10 to-success/5',
        borderColor: 'border-success/30',
        textColor: 'text-success',
        buttonColor: 'bg-success hover:bg-success/90',
        progressColor: 'stroke-success',
        bgAccent: 'bg-success/5'
    },
    LONG_BREAK: {
        label: 'Long Break',
        emoji: '🌿',
        description: 'Extended rest',
        gradient: 'from-info/20 via-info/10 to-info/5',
        borderColor: 'border-info/30',
        textColor: 'text-info',
        buttonColor: 'bg-info hover:bg-info/90',
        progressColor: 'stroke-info',
        bgAccent: 'bg-info/5'
    }
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
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoStartBreaks, setAutoStartBreaks] = useState(false);
    const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio for notifications
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio();
        }
    }, []);

    // Format time in MM:SS
    const formatTime = useCallback((seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Calculate progress percentage
    const getProgressPercentage = useCallback(() => {
        const totalTime = customTimes[currentPhase] * 60;
        return ((totalTime - timeLeft) / totalTime) * 100;
    }, [customTimes, currentPhase, timeLeft]);

    // Get current phase configuration
    const phaseConfig = PHASE_CONFIG[currentPhase];

    // Start timer
    const startTimer = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
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
    }, [isRunning]);

    // Pause timer
    const pauseTimer = useCallback(() => {
        if (isRunning && !isPaused) {
            setIsPaused(true);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [isRunning, isPaused]);

    // Resume timer
    const resumeTimer = useCallback(() => {
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
    }, [isRunning, isPaused]);

    // Stop timer
    const stopTimer = useCallback(() => {
        setIsRunning(false);
        setIsPaused(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    // Reset timer
    const resetTimer = useCallback(() => {
        stopTimer();
        setTimeLeft(customTimes[currentPhase] * 60);
    }, [stopTimer, customTimes, currentPhase]);

    // Handle timer completion
    const handleTimerComplete = useCallback(() => {
        stopTimer();

        // Play notification sound
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(console.error);
        }

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${phaseConfig.label} Complete!`, {
                body: `Time to ${currentPhase === 'FOCUS' ? 'take a break' : 'get back to work'}`,
                icon: '/favicon.ico'
            });
        }

        // Record session completion
        const sessionData: PomodoroSessionData = {
            type: currentPhase,
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
    }, [stopTimer, soundEnabled, phaseConfig, currentPhase, customTimes, onSessionComplete]);

    // Move to next phase
    const moveToNextPhase = useCallback(() => {
        if (currentPhase === 'FOCUS') {
            // After focus, take a break
            const nextPhase = completedSessions > 0 && (completedSessions + 1) % 4 === 0
                ? 'LONG_BREAK'
                : 'SHORT_BREAK';
            setCurrentPhase(nextPhase);
            setTimeLeft(customTimes[nextPhase] * 60);

            // Auto-start breaks if enabled
            if (autoStartBreaks) {
                setTimeout(() => startTimer(), 1000);
            }
        } else {
            // After break, go back to focus
            setCurrentPhase('FOCUS');
            setTimeLeft(customTimes.FOCUS * 60);

            // Auto-start pomodoros if enabled
            if (autoStartPomodoros) {
                setTimeout(() => startTimer(), 1000);
            }
        }
    }, [currentPhase, completedSessions, customTimes, autoStartBreaks, autoStartPomodoros, startTimer]);

    // Update custom times
    const updateCustomTime = useCallback((phase: PomodoroPhase, minutes: number) => {
        setCustomTimes(prev => ({
            ...prev,
            [phase]: minutes
        }));

        // If we're updating the current phase and timer is stopped, update time left
        if (phase === currentPhase && !isRunning) {
            setTimeLeft(minutes * 60);
        }
    }, [currentPhase, isRunning]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const progressPercentage = getProgressPercentage();
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className={`relative bg-gradient-to-br ${phaseConfig.gradient} border ${phaseConfig.borderColor} rounded-2xl p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-2 sm:p-2.5 rounded-xl ${phaseConfig.bgAccent} border ${phaseConfig.borderColor}`}>
                        <span className="text-lg sm:text-xl">{phaseConfig.emoji}</span>
                    </div>
                    <div>
                        <h3 className={`text-base sm:text-lg font-semibold ${phaseConfig.textColor}`}>
                            {phaseConfig.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {phaseConfig.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-all duration-200 focus-enhanced"
                        title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                    >
                        {soundEnabled ? (
                            <SpeakerWaveIcon className="w-4 h-4" />
                        ) : (
                            <SpeakerXMarkIcon className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-all duration-200 focus-enhanced"
                        title="Settings"
                    >
                        <Cog6ToothIcon className={`w-4 h-4 transition-transform duration-200 ${showSettings ? 'rotate-90' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6 sm:mb-8">
                {/* Progress Circle */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-border opacity-30"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`${phaseConfig.progressColor} transition-all duration-1000 ease-out`}
                            strokeLinecap="round"
                        />
                    </svg>
                    
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-2xl sm:text-3xl font-mono font-bold ${phaseConfig.textColor} mb-1`}>
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                            {Math.round(progressPercentage)}% complete
                        </div>
                    </div>
                </div>

                {/* Session info */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <FireIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span>Session {completedSessions + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                        <span>{completedSessions} completed</span>
                    </div>
                </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced ${phaseConfig.buttonColor}`}
                    >
                        <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Start</span>
                    </button>
                ) : isPaused ? (
                    <button
                        onClick={resumeTimer}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced ${phaseConfig.buttonColor}`}
                    >
                        <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Resume</span>
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-warning text-warning-foreground rounded-xl font-medium hover:bg-warning/90 transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced"
                    >
                        <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Pause</span>
                    </button>
                )}

                <button
                    onClick={stopTimer}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 hover:text-foreground transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced"
                >
                    <StopIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Stop</span>
                </button>

                <button
                    onClick={resetTimer}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 hover:text-foreground transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced"
                >
                    <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="border-t border-border/50 pt-4 sm:pt-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Time Settings */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">Timer Settings</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5">
                                        Focus (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={customTimes.FOCUS}
                                        onChange={(e) => updateCustomTime('FOCUS', parseInt(e.target.value) || 25)}
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 focus-enhanced"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5">
                                        Short Break (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={customTimes.SHORT_BREAK}
                                        onChange={(e) => updateCustomTime('SHORT_BREAK', parseInt(e.target.value) || 5)}
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 focus-enhanced"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5">
                                        Long Break (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={customTimes.LONG_BREAK}
                                        onChange={(e) => updateCustomTime('LONG_BREAK', parseInt(e.target.value) || 15)}
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 focus-enhanced"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Auto-start Settings */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">Auto-start</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                                    <input
                                        type="checkbox"
                                        id="autoStartBreaks"
                                        checked={autoStartBreaks}
                                        onChange={(e) => setAutoStartBreaks(e.target.checked)}
                                        className="h-4 w-4 text-primary bg-background border-2 border-border rounded focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                                    />
                                    <label htmlFor="autoStartBreaks" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                                        Auto-start breaks
                                    </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                                    <input
                                        type="checkbox"
                                        id="autoStartPomodoros"
                                        checked={autoStartPomodoros}
                                        onChange={(e) => setAutoStartPomodoros(e.target.checked)}
                                        className="h-4 w-4 text-primary bg-background border-2 border-border rounded focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                                    />
                                    <label htmlFor="autoStartPomodoros" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                                        Auto-start focus sessions
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
