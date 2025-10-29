"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    onStateChange?: (state: TimerState) => void;
    isFocusMode?: boolean;
    className?: string;
}

interface TimerState {
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    currentPhase?: string;
    sessionTime: number;
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
    onStateChange,
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

    // Notify parent of state changes
    const notifyStateChange = useCallback(() => {
        if (onStateChange) {
            onStateChange({
                isRunning,
                isPaused,
                timeLeft: 0, // TodoTimer doesn't have countdown
                currentPhase: isFocusMode ? 'FOCUS' : 'WORK',
                sessionTime: currentSessionTime
            });
        }
    }, [onStateChange, isRunning, isPaused, isFocusMode, currentSessionTime]);

    // Update state when timer changes
    useEffect(() => {
        notifyStateChange();
    }, [notifyStateChange]);

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
        <div className={`bg-card/50 border border-border/30 rounded-xl p-3 sm:p-4 ${className}`}>
            {/* Timer Display */}
            <div className="text-center mb-4">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-foreground mb-2">
                    {formatTime(currentSessionTime)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Session Time
                </div>
                <div className="text-sm sm:text-base font-semibold text-primary">
                    Total: {formatTime(totalTimeSpent * 60)}
                </div>
            </div>

            {/* Progress Bar */}
            {estimatedDuration && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                        {estimatedDuration - totalTimeSpent > 0
                            ? `${estimatedDuration - totalTimeSpent} min remaining`
                            : <span className="text-warning font-medium">Time exceeded</span>
                        }
                    </div>
                </div>
            )}

            {/* Timer Controls */}
            <div className="flex justify-center gap-2 mb-4">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        className="flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced font-medium"
                    >
                        <PlayIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Start</span>
                    </button>
                ) : isPaused ? (
                    <button
                        onClick={resumeTimer}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced font-medium"
                    >
                        <PlayIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Resume</span>
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex items-center gap-2 px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced font-medium"
                    >
                        <PauseIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Pause</span>
                    </button>
                )}

                {isRunning && (
                    <button
                        onClick={stopTimer}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced font-medium"
                    >
                        <StopIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Stop</span>
                    </button>
                )}

                <button
                    onClick={resetTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 hover:text-foreground transition-all duration-200 shadow-soft hover:shadow-medium focus-enhanced font-medium"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                </button>
            </div>

            {/* Session Notes */}
            <div className="border-t border-border/50 pt-4">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors focus-enhanced"
                >
                    <ClockIcon className="w-4 h-4 mr-2" />
                    {showNotes ? 'Hide' : 'Add'} Session Notes
                </button>

                {showNotes && (
                    <textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        placeholder="Add notes about this session..."
                        className="w-full mt-3 px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm resize-none focus-enhanced"
                        rows={2}
                    />
                )}
            </div>

            {/* Focus Mode Indicator */}
            {isFocusMode && (
                <div className="mt-4 flex items-center justify-center text-sm text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                    <span className="font-medium">Focus Mode Active</span>
                </div>
            )}
        </div>
    );
}
