"use client"

import { PlusCircle, FileText, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/todos">
                        <PlusCircle className="mr-2 h-4 w-4 text-green-600" />
                        Add New Task
                    </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/notes">
                        <FileText className="mr-2 h-4 w-4 text-blue-600" />
                        Create Note
                    </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/calendar">
                        <CalendarIcon className="mr-2 h-4 w-4 text-amber-600" />
                        View Calendar
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
