import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/patterns - Get productivity patterns and insights
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

        // Get all completed todos with completion times
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

        // Analyze peak productivity hours
        const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            completed: 0,
            points: 0
        }));

        completedTodos.forEach(todo => {
            if (todo.completedAt) {
                const completedHour = new Date(todo.completedAt).getHours();
                hourlyStats[completedHour].completed += 1;
                hourlyStats[completedHour].points += todo.points;
            }
        });

        // Find peak hours (top 3 hours with most completions)
        const peakHours = hourlyStats
            .sort((a, b) => b.completed - a.completed)
            .slice(0, 3)
            .map(stat => ({
                hour: stat.hour,
                time: `${stat.hour.toString().padStart(2, '0')}:00`,
                completed: stat.completed,
                points: stat.points
            }));

        // Analyze day-of-week patterns
        const dayStats = Array.from({ length: 7 }, (_, day) => ({
            day,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            completed: 0,
            points: 0
        }));

        completedTodos.forEach(todo => {
            if (todo.completedAt) {
                const completedDay = new Date(todo.completedAt).getDay();
                dayStats[completedDay].completed += 1;
                dayStats[completedDay].points += todo.points;
            }
        });

        // Find most productive day
        const mostProductiveDay = dayStats.reduce((max, day) =>
            day.completed > max.completed ? day : max
        );

        // Analyze priority patterns
        const priorityPatterns = await prisma.todo.groupBy({
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
            },
            _avg: {
                points: true
            }
        });

        // Analyze completion time patterns
        const completionTimeRanges = {
            sameDay: 0,
            withinWeek: 0,
            withinMonth: 0,
            overMonth: 0
        };

        completedTodos.forEach(todo => {
            if (todo.completedAt) {
                const created = new Date(todo.createdAt);
                const completed = new Date(todo.completedAt);
                const diffDays = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

                if (diffDays <= 1) completionTimeRanges.sameDay++;
                else if (diffDays <= 7) completionTimeRanges.withinWeek++;
                else if (diffDays <= 30) completionTimeRanges.withinMonth++;
                else completionTimeRanges.overMonth++;
            }
        });

        // Calculate productivity score (0-100)
        const totalTodos = await prisma.todo.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const completionRate = totalTodos > 0 ? (completedTodos.length / totalTodos) * 100 : 0;
        const avgPointsPerDay = completedTodos.length > 0 ?
            completedTodos.reduce((sum, todo) => sum + todo.points, 0) / days : 0;

        const productivityScore = Math.min(100, Math.round(
            (completionRate * 0.4) +
            (Math.min(avgPointsPerDay, 50) * 0.6)
        ));

        // Generate insights
        const insights = [];

        if (peakHours[0] && peakHours[0].completed > 0) {
            insights.push({
                type: 'peak_hour',
                message: `Your most productive hour is ${peakHours[0].time} with ${peakHours[0].completed} tasks completed.`,
                priority: 'high'
            });
        }

        if (mostProductiveDay.completed > 0) {
            insights.push({
                type: 'peak_day',
                message: `${mostProductiveDay.dayName} is your most productive day with ${mostProductiveDay.completed} tasks completed.`,
                priority: 'medium'
            });
        }

        if (completionRate < 50) {
            insights.push({
                type: 'completion_rate',
                message: `Your completion rate is ${completionRate.toFixed(1)}%. Consider breaking down large tasks into smaller ones.`,
                priority: 'high'
            });
        } else if (completionRate > 80) {
            insights.push({
                type: 'completion_rate',
                message: `Excellent! Your completion rate is ${completionRate.toFixed(1)}%. Keep up the great work!`,
                priority: 'low'
            });
        }

        if (completionTimeRanges.overMonth > completedTodos.length * 0.3) {
            insights.push({
                type: 'completion_time',
                message: 'You tend to take longer to complete tasks. Consider setting more realistic deadlines.',
                priority: 'medium'
            });
        }

        return NextResponse.json({
            period: `${days} days`,
            peakHours,
            dayPatterns: dayStats,
            mostProductiveDay,
            priorityPatterns: priorityPatterns.map(p => ({
                priority: p.priority,
                count: p._count.priority,
                avgPoints: Math.round((p._avg.points || 0) * 100) / 100
            })),
            completionTimeRanges,
            productivityScore,
            insights,
            totalCompleted: completedTodos.length,
            totalCreated: totalTodos,
            completionRate: Math.round(completionRate * 100) / 100
        });

    } catch (error) {
        console.error("Error fetching pattern analytics:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
