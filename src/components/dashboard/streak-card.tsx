"use client"

import { Flame, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StreakCardProps {
    currentStreak: number
    longestStreak: number
    totalPoints: number
    level: number
}

export function StreakCard({ currentStreak, longestStreak, totalPoints, level }: StreakCardProps) {
    const pointsWithinLevel = totalPoints % 100
    const xpForNextLevel = 100 // Assuming fixed 100 XP per level for now

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Level {level}</div>
                    <p className="text-xs text-muted-foreground mb-4">
                        {pointsWithinLevel} / {xpForNextLevel} XP
                    </p>
                    <Progress value={pointsWithinLevel} className="h-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentStreak} Days</div>
                    <p className="text-xs text-muted-foreground">
                        Longest streak: {longestStreak} days
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
