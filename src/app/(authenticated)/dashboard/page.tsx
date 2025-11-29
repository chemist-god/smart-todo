"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
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
    ClockIcon,
    ExclamationTriangleIcon
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
    const { data: session } = useSession();
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

    // Extract first name from user's name
    const firstName = useMemo(() => {
        if (!session?.user?.name) return null;
        return session.user.name.split(' ')[0];
    }, [session?.user?.name]);

    const { data, error, mutate } = useSWR<Stats>("/api/stats", fetcher, {
        refreshInterval: 30000,
        onError: (err) => {
            console.error("Error fetching stats:", err);
            setLoading(false);
        }
    });

    useEffect(() => {
        if (data) {
            setStats(data);
            setLoading(false);
        }
        if (error) {
            setLoading(false);
        }
    }, [data, error]);

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
            "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50",
            "p-2.5 sm:p-4 md:p-5",
            "shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98]",
            "hover:border-primary/20 hover:bg-card/80",
            isLoading && "animate-pulse"
        )}>
            <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn(
                    "flex-shrink-0 p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br",
                    gradient,
                    "shadow-md sm:shadow-lg group-hover:shadow-xl transition-all duration-300"
                )}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate mb-0.5 sm:mb-1 leading-tight">
                        {title}
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight sm:leading-normal">
                        {isLoading ? '...' : value}
                    </p>
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        </div>
    );

    const ProgressBar = ({ value, max, gradient = 'from-primary to-primary/80' }: { value: number; max: number; gradient?: string }) => (
        <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground font-medium">Progress</span>
                <span className="font-semibold text-foreground">{Math.min(100, (value / max) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
                <div
                    className={cn(
                        "h-2 sm:h-2.5 rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm",
                        gradient
                    )}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <div className="h-7 sm:h-8 bg-muted/50 rounded-xl w-40 sm:w-48 animate-pulse"></div>
                            <div className="h-3 sm:h-4 bg-muted/30 rounded-lg w-56 sm:w-64 animate-pulse"></div>
                        </div>
                        <div className="h-9 sm:h-10 bg-muted/50 rounded-xl w-24 sm:w-28 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 sm:h-20 md:h-24 lg:h-28 bg-muted/30 rounded-xl sm:rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 h-64 sm:h-80 md:h-96 bg-muted/30 rounded-xl sm:rounded-2xl animate-pulse"></div>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="h-40 sm:h-48 bg-muted/30 rounded-xl sm:rounded-2xl animate-pulse"></div>
                            <div className="h-32 sm:h-40 bg-muted/30 rounded-xl sm:rounded-2xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-destructive mx-auto mb-3" />
                        <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load stats</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : "An error occurred while loading your statistics"}
                        </p>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                            className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80"
                        >
                            <ArrowPathIcon className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                            {refreshing ? 'Retrying...' : 'Retry'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Welcome Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                                    <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                        Welcome back
                                    </span>
                                    {firstName && (
                                        <>
                                            <span className="text-foreground mx-1.5 sm:mx-2">,</span>
                                            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                                                {firstName}
                                            </span>
                                        </>
                                    )}
                                    <span className="ml-1.5 sm:ml-2" role="img" aria-label="wave">👋</span>
                                </h1>
                                <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse flex-shrink-0" />
                            </div>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">
                                Here's your productivity overview for today
                            </p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                            className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/20 transition-all duration-300 text-xs sm:text-sm"
                        >
                            <ArrowPathIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2", refreshing && "animate-spin")} />
                            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            <span className="sm:hidden">{refreshing ? '...' : '↻'}</span>
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 lg:grid-cols-4">
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                        {/* Focus Tasks */}
                        <div className="lg:col-span-2">
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                                <div className="p-3 sm:p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                                                <LightBulbIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                                                    Focus Tasks ✨
                                                </h2>
                                                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                                                    AI-powered priority recommendations
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs w-fit">
                                            Smart AI
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 md:p-6">
                                    <FocusTasks />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Progress & Stats */}
                        <div className="space-y-3 sm:space-y-4">
                            {/* Level Progress */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Level Progress</h3>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px] sm:text-xs">
                                                Lv.{stats.level}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between text-xs sm:text-sm">
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
                                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                                                {100 - (stats.totalPoints % 100)} XP to level {stats.level + 1}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Streak Card */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Streak</h3>
                                        <FireIcon className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                                    </div>
                                    <div className="flex items-center justify-center py-1 sm:py-2">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-2 sm:mb-3">
                                                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-destructive to-destructive/80 shadow-lg">
                                                    <FireIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                                                {stats.currentStreak}
                                            </p>
                                            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">
                                                days in a row
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                                Best: {stats.longestStreak} days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5">
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-3 sm:mb-4">Quick Actions</h3>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-auto p-2 sm:p-3 hover:bg-success/10 hover:text-success transition-all duration-200"
                                    >
                                        <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-success flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium">Create Todo</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-auto p-2 sm:p-3 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                    >
                                        <DocumentTextIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-primary flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium">Quick Note</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-auto p-2 sm:p-3 hover:bg-warning/10 hover:text-warning transition-all duration-200"
                                    >
                                        <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-warning flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium">View Calendar</span>
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
