import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/productivity - Get productivity metrics and trends
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30'; // days
        const days = parseInt(period);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get todos completed in the period
        const completedTodos = await prisma.todo.findMany({
            where: {
                userId: user.id,
                completed: true,
                completedAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { completedAt: 'asc' }
        });

        // Get all todos created in the period
        const allTodos = await prisma.todo.findMany({
            where: {
                userId: user.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Calculate daily completion rates
        const dailyStats = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayCompleted = completedTodos.filter(todo => {
                if (!todo.completedAt) return false;
                const completedDate = new Date(todo.completedAt);
                return completedDate >= date && completedDate < nextDate;
            }).length;

            const dayCreated = allTodos.filter(todo => {
                const createdDate = new Date(todo.createdAt);
                return createdDate >= date && createdDate < nextDate;
            }).length;

            dailyStats.push({
                date: date.toISOString().split('T')[0],
                completed: dayCompleted,
                created: dayCreated,
                completionRate: dayCreated > 0 ? (dayCompleted / dayCreated) * 100 : 0
            });
        }

        // Calculate weekly completion rates
        const weeklyStats = [];
        for (let i = 0; i < Math.ceil(days / 7); i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weekCompleted = completedTodos.filter(todo => {
                if (!todo.completedAt) return false;
                const completedDate = new Date(todo.completedAt);
                return completedDate >= weekStart && completedDate < weekEnd;
            }).length;

            const weekCreated = allTodos.filter(todo => {
                const createdDate = new Date(todo.createdAt);
                return createdDate >= weekStart && createdDate < weekEnd;
            }).length;

            weeklyStats.push({
                week: `Week ${i + 1}`,
                completed: weekCompleted,
                created: weekCreated,
                completionRate: weekCreated > 0 ? (weekCompleted / weekCreated) * 100 : 0
            });
        }

        // Calculate priority breakdown
        const priorityStats = await prisma.todo.groupBy({
            by: ['priority'],
            where: {
                userId: user.id,
                completed: true,
                completedAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: {
                priority: true
            }
        });

        // Calculate points earned
        const totalPointsEarned = completedTodos.reduce((sum, todo) => sum + todo.points, 0);

        // Calculate average completion time (in hours)
        const todosWithCompletionTime = completedTodos.filter(todo => todo.completedAt);
        const avgCompletionTime = todosWithCompletionTime.length > 0
            ? todosWithCompletionTime.reduce((sum, todo) => {
                const created = new Date(todo.createdAt);
                const completed = new Date(todo.completedAt!);
                const diffHours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
                return sum + diffHours;
            }, 0) / todosWithCompletionTime.length
            : 0;

        // Calculate productivity score (0-100)
        const completionRate = allTodos.length > 0 ? (completedTodos.length / allTodos.length) * 100 : 0;
        const avgPointsPerDay = completedTodos.length > 0 ?
            completedTodos.reduce((sum, todo) => sum + todo.points, 0) / days : 0;

        const productivityScore = Math.min(100, Math.round(
            (completionRate * 0.4) +
            (Math.min(avgPointsPerDay, 50) * 0.6)
        ));

        return NextResponse.json({
            period: `${days} days`,
            dailyStats,
            weeklyStats,
            priorityBreakdown: priorityStats.map(p => ({
                priority: p.priority,
                count: p._count.priority
            })),
            totalPointsEarned,
            avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
            totalCompleted: completedTodos.length,
            totalCreated: allTodos.length,
            overallCompletionRate: completionRate,
            completionRate,
            totalTasks: allTodos.length,
            completedTasks: completedTodos.length,
            productivityScore
        });

    } catch (error) {
        console.error("Error fetching productivity analytics:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
