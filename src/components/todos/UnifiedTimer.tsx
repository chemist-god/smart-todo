"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    ArrowPathIcon,
    ClockIcon
} from "@heroicons/react/24/outline";

interface UnifiedTimerProps {
    todoId: string;
    initialTimeSpent: number;
    estimatedDuration?: number;
    onTimeUpdate: (timeSpent: number) => Promise<void>;
    onSessionComplete: (sessionData: SessionData) => Promise<void>;
    timerState: TimerState;
    onStateChange: (state: TimerState) => void;
}

interface TimerState {
    isRunning: boolean;
    isPaused: boolean;
    sessionTime: number;
    startTime?: number;
}

interface SessionData {
    duration: number;
    sessionType: 'FOCUS';
    notes?: string;
}

export default function UnifiedTimer({
    todoId,
    initialTimeSpent,
    estimatedDuration,
    onTimeUpdate,
    onSessionComplete,
    timerState,
    onStateChange
}: UnifiedTimerProps) {
    const [totalTimeSpent, setTotalTimeSpent] = useState(initialTimeSpent);
    const [sessionNotes, setSessionNotes] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Format time in MM:SS
    const formatTime = useCallback((seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Calculate progress percentage
    const progressPercentage = estimatedDuration
        ? Math.min((totalTimeSpent / estimatedDuration) * 100, 100)
        : 0;

    // Start timer
    const startTimer = useCallback(() => {
        if (!timerState.isRunning) {
            const newState = {
                ...timerState,
                isRunning: true,
                isPaused: false,
                startTime: Date.now()
            };
            onStateChange(newState);

            intervalRef.current = setInterval(() => {
                onStateChange(prev => ({
                    ...prev,
                    sessionTime: prev.sessionTime + 1
                }));
            }, 1000);
        }
    }, [timerState, onStateChange]);

    // Pause timer
    const pauseTimer = useCallback(() => {
        if (timerState.isRunning && !timerState.isPaused) {
            onStateChange({
                ...timerState,
                isPaused: true
            });
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [timerState, onStateChange]);

    // Resume timer
    const resumeTimer = useCallback(() => {
        if (timerState.isRunning && timerState.isPaused) {
            onStateChange({
                ...timerState,
                isPaused: false,
                startTime: Date.now()
            });

            intervalRef.current = setInterval(() => {
                onStateChange(prev => ({
                    ...prev,
                    sessionTime: prev.sessionTime + 1
                }));
            }, 1000);
        }
    }, [timerState, onStateChange]);

    // Stop timer
    const stopTimer = useCallback(async () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Save session if there was meaningful time
        if (timerState.sessionTime > 0) {
            const sessionData: SessionData = {
                duration: timerState.sessionTime,
                sessionType: 'FOCUS',
                notes: sessionNotes || undefined
            };
            
            const newTotal = totalTimeSpent + Math.floor(timerState.sessionTime / 60);
            setTotalTimeSpent(newTotal);
            await onTimeUpdate(newTotal);
            await onSessionComplete(sessionData);
        }

        // Reset timer state
        onStateChange({
            isRunning: false,
            isPaused: false,
            sessionTime: 0
        });
        setSessionNotes("");
        setShowNotes(false);
    }, [timerState, totalTimeSpent, sessionNotes, onTimeUpdate, onSessionComplete, onStateChange]);

    // Reset timer
    const resetTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        onStateChange({
            isRunning: false,
            isPaused: false,
            sessionTime: 0
        });
    }, [onStateChange]);

    // Auto-resume timer if it was running
    useEffect(() => {
        if (timerState.isRunning && !timerState.isPaused && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                onStateChange(prev => ({
                    ...prev,
                    sessionTime: prev.sessionTime + 1
                }));
            }, 1000);
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState.isRunning, timerState.isPaused, onStateChange]);

    return (
        <div className="bg-card/30 border border-border/20 rounded-xl p-3 sm:p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-foreground">Focus Timer</h4>
                    <p className="text-xs text-muted-foreground">Track your productivity</p>
                </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-3 sm:mb-4">
                <div className="text-xl sm:text-2xl font-mono font-bold text-foreground mb-1 sm:mb-2">
                    {formatTime(timerState.sessionTime)}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                    Session Time
                </div>
                <div className="text-sm font-medium text-primary">
                    Total: {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
                </div>
            </div>

            {/* Progress Bar */}
            {estimatedDuration && (
                <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5 sm:h-2 overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 text-center">
                        {estimatedDuration - totalTimeSpent > 0
                            ? `${estimatedDuration - totalTimeSpent} min remaining`
                            : <span className="text-warning font-medium">Time exceeded</span>
                        }
                    </div>
                </div>
            )}

            {/* Timer Controls */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {!timerState.isRunning ? (
                    <button
                        onClick={startTimer}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
                    >
                        <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Start</span>
                    </button>
                ) : timerState.isPaused ? (
                    <button
                        onClick={resumeTimer}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
                    >
                        <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Resume</span>
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-all duration-200 text-sm font-medium"
                    >
                        <PauseIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Pause</span>
                    </button>
                )}

                {timerState.isRunning && (
                    <button
                        onClick={stopTimer}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all duration-200 text-sm font-medium"
                    >
                        <StopIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Stop</span>
                    </button>
                )}

                <button
                    onClick={resetTimer}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 hover:text-foreground transition-all duration-200 text-sm font-medium"
                >
                    <ArrowPathIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Reset</span>
                </button>
            </div>

            {/* Session Notes */}
            <div className="border-t border-border/20 pt-3">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                    {showNotes ? 'Hide' : 'Add'} Session Notes
                </button>

                {showNotes && (
                    <textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        placeholder="Add notes about this session..."
                        className="w-full mt-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all duration-200 text-xs sm:text-sm resize-none"
                        rows={2}
                    />
                )}
            </div>
        </div>
    );
}
