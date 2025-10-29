"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    CheckCircleIcon,
    DocumentTextIcon,
    TrophyIcon,
    FireIcon,
    CalendarIcon,
    ChartBarIcon,
    LightBulbIcon,
    ArrowPathIcon,
    SparklesIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FocusTasks from "@/components/todos/FocusTasks";

interface Stats {
    totalPoints: number;
    level: number;
    xpToNextLevel: number;
    currentStreak: number;
    longestStreak: number;
    todosCompleted: number;
    notesCreated: number;
    achievementsUnlocked: number;
    totalTodos: number;
    pendingTodos: number;
    overdueTodos: number;
    todayTodos: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalPoints: 0,
        level: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        todosCompleted: 0,
        notesCreated: 0,
        achievementsUnlocked: 0,
        totalTodos: 0,
        pendingTodos: 0,
        overdueTodos: 0,
        todayTodos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { data, error, mutate } = useSWR<Stats>("/api/stats", fetcher, { refreshInterval: 30000 });

    useEffect(() => {
        if (data) {
            setStats(data);
            setLoading(false);
        }
    }, [data]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await mutate();
        setRefreshing(false);
    };

    const StatCard = ({
        title,
        value,
        icon: Icon,
        gradient = 'from-primary to-primary/80',
        loading: isLoading
    }: {
        title: string;
        value: number | string;
        icon: React.ComponentType<{ className?: string }>;
        gradient?: string;
        loading?: boolean;
    }) => (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 sm:p-5",
            "shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
            "hover:border-primary/20 hover:bg-card/80",
            isLoading && "animate-pulse"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br",
                        gradient,
                        "shadow-lg group-hover:shadow-xl transition-all duration-300"
                    )}>
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-1">
                            {title}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                            {isLoading ? '...' : value}
                        </p>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        </div>
    );

    const ProgressBar = ({ value, max, gradient = 'from-primary to-primary/80' }: { value: number; max: number; gradient?: string }) => (
        <div className="space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progress</span>
                <span className="font-semibold text-foreground">{Math.min(100, (value / max) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                    className={cn(
                        "h-2.5 rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm",
                        gradient
                    )}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-8 bg-muted/50 rounded-xl w-48 animate-pulse"></div>
                            <div className="h-4 bg-muted/30 rounded-lg w-64 animate-pulse"></div>
                        </div>
                        <div className="h-10 bg-muted/50 rounded-xl w-28 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 sm:h-24 bg-muted/30 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-80 sm:h-96 bg-muted/30 rounded-2xl animate-pulse"></div>
                        <div className="space-y-4">
                            <div className="h-48 bg-muted/30 rounded-2xl animate-pulse"></div>
                            <div className="h-40 bg-muted/30 rounded-2xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                    {/* Welcome Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    Welcome back! 👋
                                </h1>
                                <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground font-medium">
                                Here's your productivity overview for today
                            </p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                            className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/20 transition-all duration-300"
                        >
                            <ArrowPathIcon className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        <StatCard
                            title="Total Points"
                            value={stats.totalPoints.toLocaleString()}
                            icon={TrophyIcon}
                            gradient="from-warning to-warning/80"
                            loading={refreshing}
                        />
                        <StatCard
                            title="Current Streak"
                            value={`${stats.currentStreak} days`}
                            icon={FireIcon}
                            gradient="from-destructive to-destructive/80"
                            loading={refreshing}
                        />
                        <StatCard
                            title="Active Todos"
                            value={`${stats.todayTodos}/${stats.pendingTodos}`}
                            icon={CheckCircleIcon}
                            gradient="from-success to-success/80"
                            loading={refreshing}
                        />
                        <StatCard
                            title="Achievements"
                            value={`${stats.achievementsUnlocked}`}
                            icon={SparklesIcon}
                            gradient="from-primary to-primary/80"
                            loading={refreshing}
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Focus Tasks */}
                        <div className="lg:col-span-2">
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg overflow-hidden">
                                <div className="p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                                                <LightBulbIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-foreground">
                                                    Focus Tasks ✨
                                                </h2>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    AI-powered priority recommendations
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                            Smart AI
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <FocusTasks />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Progress & Stats */}
                        <div className="space-y-4">
                            {/* Level Progress */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg p-4 sm:p-5">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base sm:text-lg font-semibold text-foreground">Level Progress</h3>
                                        <div className="flex items-center gap-2">
                                            <TrophyIcon className="h-5 w-5 text-warning" />
                                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                                                Lv.{stats.level}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Experience</span>
                                            <span className="font-semibold text-foreground">
                                                {stats.totalPoints.toLocaleString()} XP
                                            </span>
                                        </div>
                                        <ProgressBar
                                            value={stats.totalPoints % 100}
                                            max={100}
                                            gradient="from-warning to-warning/80"
                                        />
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {100 - (stats.totalPoints % 100)} XP to level {stats.level + 1}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Streak Card */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg p-4 sm:p-5">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base sm:text-lg font-semibold text-foreground">Streak</h3>
                                        <FireIcon className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div className="flex items-center justify-center py-2">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-3">
                                                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-lg">
                                                    <FireIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                                                {stats.currentStreak}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                                days in a row
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Best: {stats.longestStreak} days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg p-4 sm:p-5">
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-start h-auto p-3 hover:bg-success/10 hover:text-success transition-all duration-200"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-3 text-success" />
                                        <span className="text-sm font-medium">Create Todo</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-start h-auto p-3 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                    >
                                        <DocumentTextIcon className="h-4 w-4 mr-3 text-primary" />
                                        <span className="text-sm font-medium">Quick Note</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-start h-auto p-3 hover:bg-warning/10 hover:text-warning transition-all duration-200"
                                    >
                                        <CalendarIcon className="h-4 w-4 mr-3 text-warning" />
                                        <span className="text-sm font-medium">View Calendar</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
