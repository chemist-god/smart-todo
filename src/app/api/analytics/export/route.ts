import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/export - Export analytics data as CSV
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'csv';
        const period = searchParams.get('period') || '30';
        const days = parseInt(period);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all data for the period
        const [todos, notes, userStats] = await Promise.all([
            prisma.todo.findMany({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.note.findMany({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.userStats.findUnique({
                where: { userId: user.id }
            })
        ]);

        if (format === 'csv') {
            // Generate CSV data
            const csvData = generateCSVData(todos, notes, userStats, startDate, endDate);

            return new NextResponse(csvData, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="smart-todo-analytics-${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        // For other formats, return JSON data
        return NextResponse.json({
            period: `${days} days`,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            todos: todos.map(todo => ({
                id: todo.id,
                title: todo.title,
                description: todo.description,
                completed: todo.completed,
                priority: todo.priority,
                points: todo.points,
                dueDate: todo.dueDate?.toISOString(),
                createdAt: todo.createdAt.toISOString(),
                completedAt: todo.completedAt?.toISOString()
            })),
            notes: notes.map(note => ({
                id: note.id,
                title: note.title,
                type: note.type,
                createdAt: note.createdAt.toISOString(),
                updatedAt: note.updatedAt.toISOString()
            })),
            userStats: userStats ? {
                totalPoints: userStats.totalPoints,
                level: userStats.level,
                currentStreak: userStats.currentStreak,
                longestStreak: userStats.longestStreak,
                todosCompleted: userStats.todosCompleted,
                notesCreated: userStats.notesCreated,
                achievementsUnlocked: userStats.achievementsUnlocked
            } : null
        });

    } catch (error) {
        console.error("Error exporting analytics data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function generateCSVData(todos: any[], notes: any[], userStats: any, startDate: Date, endDate: Date): string {
    const lines = [];

    // Header
    lines.push('SmartTodo Analytics Export');
    lines.push(`Export Date: ${new Date().toISOString()}`);
    lines.push(`Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    lines.push('');

    // User Stats Summary
    if (userStats) {
        lines.push('USER STATISTICS SUMMARY');
        lines.push('Metric,Value');
        lines.push(`Total Points,${userStats.totalPoints}`);
        lines.push(`Level,${userStats.level}`);
        lines.push(`Current Streak,${userStats.currentStreak}`);
        lines.push(`Longest Streak,${userStats.longestStreak}`);
        lines.push(`Todos Completed,${userStats.todosCompleted}`);
        lines.push(`Notes Created,${userStats.notesCreated}`);
        lines.push(`Achievements Unlocked,${userStats.achievementsUnlocked}`);
        lines.push('');
    }

    // Todos Data
    lines.push('TODOS DATA');
    lines.push('ID,Title,Description,Completed,Priority,Points,Due Date,Created At,Completed At');
    todos.forEach(todo => {
        const row = [
            todo.id,
            `"${todo.title.replace(/"/g, '""')}"`,
            `"${(todo.description || '').replace(/"/g, '""')}"`,
            todo.completed,
            todo.priority,
            todo.points,
            todo.dueDate ? new Date(todo.dueDate).toISOString() : '',
            new Date(todo.createdAt).toISOString(),
            todo.completedAt ? new Date(todo.completedAt).toISOString() : ''
        ];
        lines.push(row.join(','));
    });
    lines.push('');

    // Notes Data
    lines.push('NOTES DATA');
    lines.push('ID,Title,Type,Created At,Updated At');
    notes.forEach(note => {
        const row = [
            note.id,
            `"${note.title.replace(/"/g, '""')}"`,
            note.type,
            new Date(note.createdAt).toISOString(),
            new Date(note.updatedAt).toISOString()
        ];
        lines.push(row.join(','));
    });

    return lines.join('\n');
}
