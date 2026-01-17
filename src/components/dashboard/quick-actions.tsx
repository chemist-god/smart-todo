"use client"

import { PlusCircle, FileText, Calendar as CalendarIcon, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function QuickActions() {
    const actions = [
        {
            label: "Add New Task",
            icon: PlusCircle,
            href: "/todos",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            hoverBg: "hover:bg-emerald-500/20"
        },
        {
            label: "Create Note",
            icon: FileText,
            href: "/notes",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            hoverBg: "hover:bg-blue-500/20"
        },
        {
            label: "View Calendar",
            icon: CalendarIcon,
            href: "/calendar",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            hoverBg: "hover:bg-amber-500/20"
        }
    ]

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant="ghost"
                        className="w-full justify-between h-auto py-3 px-4 bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border transition-all group"
                        asChild
                    >
                        <Link href={action.href}>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg transition-colors", action.bg, action.color)}>
                                    <action.icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{action.label}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </Button>
                ))}
            </CardContent>
        </Card>
    )
}
