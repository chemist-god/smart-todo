import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stats - Get user statistics and progress
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create user stats
        let userStats = await prisma.userStats.findUnique({
            where: { userId: user.id },
        });

        if (!userStats) {
            userStats = await prisma.userStats.create({
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
        }

        // Get todo statistics
        const todos = await prisma.todo.findMany({
            where: { userId: user.id },
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

        // Get notes count and category breakdown
        const notesCount = await prisma.note.count({
            where: { userId: user.id },
        });

        // Get category counts
        const categoryCounts = await prisma.note.groupBy({
            by: ['type'],
            where: { userId: user.id },
            _count: {
                type: true
            }
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

        // Get achievements count
        const achievementsUnlocked = await prisma.userAchievement.count({
            where: { userId: user.id },
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

            await prisma.userStats.update({
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
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
