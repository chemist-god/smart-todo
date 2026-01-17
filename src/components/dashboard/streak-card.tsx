"use client"

import { Flame, Trophy, Award, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface StreakCardProps {
    currentStreak: number
    longestStreak: number
    totalPoints: number
    level: number
}

export function StreakCard({ currentStreak, longestStreak, totalPoints, level }: StreakCardProps) {
    const pointsWithinLevel = totalPoints % 100
    const xpForNextLevel = 100 // Assuming fixed 100 XP per level for now
    const progress = (pointsWithinLevel / xpForNextLevel) * 100

    return (
        <div className="flex flex-col gap-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-32 h-32 rotate-12" />
                </div>

                <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="flex items-center gap-2 text-white/90">
                        <Award className="h-5 w-5" />
                        Level Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                    <div className="flex items-baseline justify-between">
                        <div className="text-4xl font-bold">Lvl {level}</div>
                        <div className="text-sm font-medium text-white/80">
                            {pointsWithinLevel} <span className="text-white/40">/ {xpForNextLevel} XP</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Progress value={progress} className="h-2.5 bg-black/20" indicatorClassName="bg-white/90" />
                        <p className="text-xs text-white/60 text-right">
                            {xpForNextLevel - pointsWithinLevel} XP to Level {level + 1}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-orange-200/50 dark:border-orange-900/50 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-base font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                        <Flame className="h-5 w-5 fill-orange-500 text-orange-600" />
                        Daily Streak
                    </CardTitle>
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        Fire Mode
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2 mb-2">
                        <div className="text-4xl font-bold tracking-tight">{currentStreak}</div>
                        <div className="text-sm font-medium text-muted-foreground mb-1.5">Days</div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        Best Record: <span className="font-medium text-foreground">{longestStreak} days</span>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
