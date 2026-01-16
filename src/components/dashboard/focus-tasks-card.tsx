"use client"

import { Lightbulb, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import FocusTasks from "@/components/todos/FocusTasks"

export function FocusTasksCard() {
    return (
        <Card className="col-span-1 lg:col-span-2 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Lightbulb className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
                        Focus Tasks
                    </CardTitle>
                    <CardDescription>AI-powered priority recommendations based on the 80/20 rule</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Smart AI
                </Badge>
            </CardHeader>
            <CardContent className="pt-6">
                <FocusTasks />
            </CardContent>
        </Card>
    )
}
