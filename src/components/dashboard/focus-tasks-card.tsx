"use client"

import { Lightbulb, Info, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import FocusTasks from "@/components/todos/FocusTasks"

export function FocusTasksCard() {
    return (
        <Card className="col-span-1 lg:col-span-2 shadow-lg border-muted/40 bg-card/60 backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24 text-primary rotate-12" />
            </div>

            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                            <Lightbulb className="h-5 w-5 fill-yellow-500/20" />
                        </div>
                        Focus Zone
                    </CardTitle>
                    <CardDescription className="max-w-md">
                        AI-powered recommendations to help you follow the 80/20 rule for maximum productivity.
                    </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 py-1.5 px-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Smart AI
                </Badge>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
                <FocusTasks />
            </CardContent>
        </Card>
    )
}
