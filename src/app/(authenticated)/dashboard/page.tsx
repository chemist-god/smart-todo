"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { FocusTasksCard } from "@/components/dashboard/focus-tasks-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { QuickActions } from "@/components/dashboard/quick-actions";

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

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Failed to load stats</p>
                <Button onClick={handleRefresh} variant="outline">Retry</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <DashboardHeader onRefresh={handleRefresh} refreshing={refreshing} />

            <StatsGrid stats={stats} loading={loading} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <FocusTasksCard />

                <div className="space-y-6">
                    <StreakCard
                        currentStreak={stats.currentStreak}
                        longestStreak={stats.longestStreak}
                        totalPoints={stats.totalPoints}
                        level={stats.level}
                    />
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}
