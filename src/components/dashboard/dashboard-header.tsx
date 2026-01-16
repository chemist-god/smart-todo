"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import { Sparkles, RefreshCw } from "lucide-react"
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

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Welcome back
                    {firstName && (
                        <>
                            ,{" "}
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {firstName}
                            </span>
                        </>
                    )}
                    <span className="ml-2 inline-block animate-wave origin-[70%_70%]">👋</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                    Here&apos;s your productivity overview for today.
                </p>
            </div>
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={refreshing}
                className="gap-2"
                size="sm"
            >
                <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
                {refreshing ? "Refreshing..." : "Refresh Stats"}
            </Button>
        </div>
    )
}
