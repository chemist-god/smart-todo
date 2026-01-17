"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import { Sparkles, RefreshCw, CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
    onRefresh: () => Promise<void>
    refreshing: boolean
}

export function DashboardHeader({ onRefresh, refreshing }: DashboardHeaderProps) {
    const { data: session } = useSession()

    const firstName = useMemo(() => {
        if (!session?.user?.name) return null
        return session.user.name.split(" ")[0]
    }, [session?.user?.name])

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span>{currentDate}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {" "}
                    <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        {firstName || "User"}
                    </span>
                    <span className="ml-2 inline-block animate-wave origin-[70%_70%]">👋</span>
                </h1>
                <p className="text-base text-muted-foreground/80 max-w-lg">
                    Ready to crush your goals today? Here's your daily productivity overview.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="h-10 gap-2 border-border/60 bg-background/50 backdrop-blur-sm transition-all hover:bg-accent hover:border-accent"
                >
                    <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
                    <span className="hidden sm:inline">Refresh Stats</span>
                </Button>
            </div>
        </div>
    )
}
