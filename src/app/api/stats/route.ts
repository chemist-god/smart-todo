import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";

// GET /api/stats - Get user statistics and progress
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create user stats with retry
        let userStats = await withRetry(async () => {
            return await prisma.userStats.findUnique({
                where: { userId: user.id },
            });
        });

        if (!userStats) {
            userStats = await withRetry(async () => {
                return await prisma.userStats.create({
                    data: {
                        userId: user.id,
                        totalPoints: 0,
                        level: 1,
                        currentStreak: 0,
                        longestStreak: 0,
                        todosCompleted: 0,
                        notesCreated: 0,
                        achievementsUnlocked: 0,
                        lastActiveDate: new Date(),
                    },
                });
            });
        }

        // Get todo statistics with retry
        const todos = await withRetry(async () => {
            return await prisma.todo.findMany({
                where: { userId: user.id },
            });
        });

        const totalTodos = todos.length;
        const todosCompleted = todos.filter(todo => todo.completed).length;
        const pendingTodos = totalTodos - todosCompleted;

        // Calculate overdue todos
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueTodos = todos.filter(todo =>
            !todo.completed &&
            todo.dueDate &&
            new Date(todo.dueDate) < today
        ).length;

        // Calculate today's todos
        const todayTodos = todos.filter(todo => {
            if (!todo.dueDate) return false;
            const todoDate = new Date(todo.dueDate);
            return todoDate.toDateString() === today.toDateString();
        }).length;

        // Get notes count and category breakdown with retry
        const notesCount = await withRetry(async () => {
            return await prisma.note.count({
                where: { userId: user.id },
            });
        });

        // Get category counts with retry
        const categoryCounts = await withRetry(async () => {
            return await prisma.note.groupBy({
                by: ['type'],
                where: { userId: user.id },
                _count: {
                    type: true
                }
            });
        });

        // Convert to the expected format
        const categoryCount = {
            GENERAL: 0,
            BIBLE_STUDY: 0,
            CONFERENCE: 0,
            SONG: 0,
            QUOTE: 0,
            REFLECTION: 0
        };

        categoryCounts.forEach(cat => {
            if (cat.type in categoryCount) {
                categoryCount[cat.type as keyof typeof categoryCount] = cat._count.type;
            }
        });

        // Get achievements count with retry
        const achievementsUnlocked = await withRetry(async () => {
            return await prisma.userAchievement.count({
                where: { userId: user.id },
            });
        });

        // Calculate level and XP
        const totalPoints = userStats.totalPoints;
        const level = Math.floor(totalPoints / 100) + 1;
        const xpToNextLevel = 100 - (totalPoints % 100);

        // Calculate streak
        const lastActive = new Date(userStats.lastActiveDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        let currentStreak = userStats.currentStreak;
        let longestStreak = userStats.longestStreak;

        // Check if user was active today or yesterday to maintain streak
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (lastActive >= todayStart) {
            // User was active today, maintain streak
            currentStreak = userStats.currentStreak;
        } else if (lastActive >= yesterday) {
            // User was active yesterday, maintain streak
            currentStreak = userStats.currentStreak;
        } else {
            // User missed a day, reset streak
            currentStreak = 0;
        }

        // Update longest streak if current streak is longer
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }

        // Update user stats if there are changes
        if (userStats.todosCompleted !== todosCompleted ||
            userStats.notesCreated !== notesCount ||
            userStats.achievementsUnlocked !== achievementsUnlocked ||
            userStats.currentStreak !== currentStreak ||
            userStats.longestStreak !== longestStreak) {

            await withRetry(async () => {
                return await prisma.userStats.update({
                    where: { userId: user.id },
                    data: {
                        todosCompleted,
                        notesCreated: notesCount,
                        achievementsUnlocked,
                        currentStreak,
                        longestStreak,
                        lastActiveDate: new Date(),
                    },
                });
            });
        }

        return NextResponse.json({
            totalPoints,
            level,
            xpToNextLevel,
            currentStreak,
            longestStreak,
            todosCompleted,
            notesCreated: notesCount,
            categoryCount,
            achievementsUnlocked,
            totalTodos,
            pendingTodos,
            overdueTodos,
            todayTodos,
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);

        // Provide fallback data when database is unavailable
        if (error instanceof Error &&
            (error.message.includes('connection') ||
                error.message.includes('timeout') ||
                error.message.includes('pool') ||
                error.message.includes('P2024') ||
                error.message.includes('P1001'))) {

            console.warn("Database unavailable, returning fallback data");
            return NextResponse.json({
                totalPoints: 0,
                level: 1,
                xpToNextLevel: 100,
                currentStreak: 0,
                longestStreak: 0,
                todosCompleted: 0,
                notesCreated: 0,
                categoryCount: {
                    GENERAL: 0,
                    BIBLE_STUDY: 0,
                    CONFERENCE: 0,
                    SONG: 0,
                    QUOTE: 0,
                    REFLECTION: 0
                },
                achievementsUnlocked: 0,
                totalTodos: 0,
                pendingTodos: 0,
                overdueTodos: 0,
                todayTodos: 0,
                _fallback: true // Indicate this is fallback data
            });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
