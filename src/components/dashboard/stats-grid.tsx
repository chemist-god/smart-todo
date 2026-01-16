"use client"

import {
    Trophy,
    Flame,
    CheckCircle2,
    Target
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        )
    }

    const items = [
        {
            title: "Total Points",
            value: stats.totalPoints.toLocaleString(),
            icon: Trophy,
            color: "text-yellow-600",
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
            description: `Level ${stats.level}`
        },
        {
            title: "Current Streak",
            value: `${stats.currentStreak} days`,
            icon: Flame,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
            description: "Keep it up!"
        },
        {
            title: "Active Todos",
            value: `${stats.todayTodos}/${stats.pendingTodos}`,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            description: "Today's progress"
        },
        {
            title: "Achievements",
            value: stats.achievementsUnlocked,
            icon: Target,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            description: "Unlocked so far"
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${item.bg}`}>
                            <item.icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                            <h3 className="text-2xl font-bold tracking-tight">{item.value}</h3>
                            <p className="text-xs text-muted-foreground mt-1 text-nowrap">{item.description}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
