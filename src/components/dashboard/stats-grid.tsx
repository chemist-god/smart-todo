"use client"

import {
    Trophy,
    Flame,
    CheckCircle2,
    Target,
    TrendingUp,
    Zap,
    Star
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface DashboardStats {
    totalPoints: number
    currentStreak: number
    todayTodos: number
    pendingTodos: number
    achievementsUnlocked: number
    level: number
}

interface StatsGridProps {
    stats: DashboardStats
    loading?: boolean
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[140px] rounded-2xl" />
                ))}
            </div>
        )
    }

    const items = [
        {
            title: "Total Points",
            value: stats.totalPoints.toLocaleString(),
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-200 dark:border-amber-900/50",
            description: `Level ${stats.level} Achiever`,
            trend: "+12% this week",
            trendColor: "text-emerald-500"
        },
        {
            title: "Current Streak",
            value: `${stats.currentStreak} Days`,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-200 dark:border-orange-900/50",
            description: "You're on fire!",
            trend: "Personal best: " + stats.currentStreak,
            trendColor: "text-orange-500"
        },
        {
            title: "Today's Focus",
            value: `${stats.todayTodos}/${stats.pendingTodos}`,
            icon: Zap,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-200 dark:border-blue-900/50",
            description: "Tasks Completed",
            trend: "Keep going!",
            trendColor: "text-blue-500"
        },
        {
            title: "Achievements",
            value: stats.achievementsUnlocked,
            icon: Star,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-200 dark:border-purple-900/50",
            description: "Medals Earned",
            trend: "2 New available",
            trendColor: "text-purple-500"
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title} className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl border bg-card/50 backdrop-blur-sm",
                    item.border
                )}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{item.title}</p>
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">{item.value}</h3>
                            </div>
                            <div className={cn("p-3 rounded-xl", item.bg)}>
                                <item.icon className={cn("size-5", item.color)} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground/80">{item.description}</span>
                            {/* <span className={cn("font-medium flex items-center gap-1", item.trendColor)}>
                                <TrendingUp className="size-3" />
                                {item.trend}
                            </span> */}
                        </div>

                        {/* Decorative gradient blob */}
                        <div className={cn(
                            "absolute -bottom-4 -right-4 size-24 rounded-full blur-2xl opacity-10 pointer-events-none",
                            item.color.replace('text-', 'bg-')
                        )} />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
