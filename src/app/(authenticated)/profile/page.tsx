"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    UserCircleIcon,
    TrophyIcon,
    FireIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CalendarIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

interface UserStats {
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

interface WalletData {
    balance: number;
    totalEarned: number;
    totalLost: number;
    totalStaked: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    rank: number;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const { data: stats, isLoading: statsLoading } = useSWR<UserStats>("/api/stats", fetcher);
    const { data: wallet, isLoading: walletLoading } = useSWR<WalletData>("/api/wallet", fetcher);
    const { data: achievements, isLoading: achievementsLoading } = useSWR<any[]>("/api/achievements", fetcher);

    const StatCard = ({
        title,
        value,
        icon: Icon,
        gradient,
        subtitle
    }: {
        title: string;
        value: string | number;
        icon: any;
        gradient?: string;
        subtitle?: string;
    }) => (
        <Card className={cn("border-border/50", gradient && `bg-gradient-to-br ${gradient}`)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn("p-3 rounded-xl", gradient ? "bg-white/20" : "bg-primary/10")}>
                        <Icon className={cn("h-6 w-6", gradient ? "text-white" : "text-primary")} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (statsLoading || walletLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
            <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <Card className="mb-6 border-border/50 shadow-soft bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl sm:text-4xl font-bold text-primary-foreground shadow-lg">
                                    {session?.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-background flex items-center justify-center">
                                    <div className="w-2 h-2 bg-success-foreground rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                                    {session?.user?.name || "User"}
                                </h1>
                                <p className="text-muted-foreground mb-3">{session?.user?.email}</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                        Level {stats?.level || 1}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-success/10 text-success">
                                        {stats?.currentStreak || 0} Day Streak
                                    </Badge>
                                    {wallet?.rank && wallet.rank > 0 && (
                                        <Badge variant="secondary" className="bg-warning/10 text-warning">
                                            Rank #{wallet.rank}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Points"
                        value={stats?.totalPoints || 0}
                        icon={SparklesIcon}
                        gradient="from-primary/20 to-primary/10"
                    />
                    <StatCard
                        title="Todos Completed"
                        value={stats?.todosCompleted || 0}
                        icon={CheckCircleIcon}
                        gradient="from-success/20 to-success/10"
                    />
                    <StatCard
                        title="Achievements"
                        value={stats?.achievementsUnlocked || 0}
                        icon={TrophyIcon}
                        gradient="from-warning/20 to-warning/10"
                    />
                    <StatCard
                        title="Wallet Balance"
                        value={formatCurrency(wallet?.balance || 0)}
                        icon={CurrencyDollarIcon}
                        gradient="from-info/20 to-info/10"
                    />
                </div>

                {/* Detailed Stats */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Productivity Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ChartBarIcon className="h-5 w-5 text-primary" />
                                        Productivity Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Todos</span>
                                        <span className="font-semibold">{stats?.totalTodos || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Pending</span>
                                        <span className="font-semibold text-warning">{stats?.pendingTodos || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Today's Todos</span>
                                        <span className="font-semibold text-info">{stats?.todayTodos || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Notes Created</span>
                                        <span className="font-semibold">{stats?.notesCreated || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Streak Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FireIcon className="h-5 w-5 text-warning" />
                                        Streak Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Current Streak</span>
                                        <span className="font-semibold text-warning">{stats?.currentStreak || 0} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Longest Streak</span>
                                        <span className="font-semibold">{stats?.longestStreak || 0} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">XP to Next Level</span>
                                        <span className="font-semibold text-primary">{stats?.xpToNextLevel || 0} XP</span>
                                    </div>
                                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Progress to Level {((stats?.level || 1) + 1)}</p>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${((stats?.totalPoints || 0) % 100) / 100 * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrophyIcon className="h-5 w-5 text-warning" />
                                    Achievements
                                </CardTitle>
                                <CardDescription>
                                    Your unlocked achievements and progress
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {achievementsLoading ? (
                                    <LoadingSpinner />
                                ) : achievements && Array.isArray(achievements) && achievements.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {achievements.map((achievement: any) => (
                                            <div
                                                key={achievement.id}
                                                className="p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-warning/10 rounded-lg">
                                                        <TrophyIcon className="h-6 w-6 text-warning" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {achievement.description}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No achievements unlocked yet. Keep working to earn your first achievement!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClockIcon className="h-5 w-5 text-info" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    Your recent actions and milestones
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-muted-foreground py-8">
                                    Activity feed coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="wallet" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CurrencyDollarIcon className="h-5 w-5 text-success" />
                                        Wallet Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Current Balance</span>
                                        <span className="font-bold text-lg text-foreground">
                                            {formatCurrency(wallet?.balance || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Earned</span>
                                        <span className="font-semibold text-success">
                                            {formatCurrency(wallet?.totalEarned || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Staked</span>
                                        <span className="font-semibold">
                                            {formatCurrency(wallet?.totalStaked || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Completion Rate</span>
                                        <span className="font-semibold text-info">
                                            {(wallet?.completionRate || 0).toFixed(1)}%
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <StarIcon className="h-5 w-5 text-warning" />
                                        Leaderboard
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {wallet?.rank && wallet.rank > 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-4xl font-bold text-primary mb-2">
                                                #{wallet.rank}
                                            </div>
                                            <p className="text-muted-foreground">
                                                You're ranked #{wallet.rank} on the leaderboard!
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            Start completing tasks to climb the leaderboard!
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

