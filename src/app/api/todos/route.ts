import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

// GET /api/todos - Get all todos for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "all";
        const sortBy = searchParams.get("sortBy") || "created";

        // Build where clause
        const where: { userId: string; completed?: boolean } = { userId: session.user.id };
        if (filter === "active") {
            where.completed = false;
        } else if (filter === "completed") {
            where.completed = true;
        }

        // Build orderBy
        let orderBy: Prisma.TodoOrderByWithRelationInput | Prisma.TodoOrderByWithRelationInput[] = {};
        if (sortBy === "due") {
            orderBy = { dueDate: 'asc' };
        } else if (sortBy === "priority") {
            orderBy = [
                { priority: 'desc' },
                { dueDate: 'asc' },
            ];
        } else {
            orderBy = { createdAt: 'desc' };
        }

        const todos = await prisma.todo.findMany({
            where,
            orderBy,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Validate required fields
        if (!data.title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Calculate points based on priority
        const pointsMap = {
            LOW: 5,
            MEDIUM: 10,
            HIGH: 15,
        };

        const todo = await prisma.todo.create({
            data: {
                title: data.title,
                description: data.description || null,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                priority: data.priority || "MEDIUM",
                points: pointsMap[data.priority as keyof typeof pointsMap] || 10,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update user stats
        await updateUserStats(session.user.id);

        // Check for achievements
        await checkAndAwardTodoAchievements(session.user.id);

        return NextResponse.json(todo, { status: 201 });
    } catch (error) {
        console.error("Error creating todo:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Helper function to update user stats
async function updateUserStats(userId: string) {
    try {
        const [/* totalTodos */, completedTodos] = await Promise.all([
            prisma.todo.count({ where: { userId } }),
            prisma.todo.count({ where: { userId, completed: true } }),
        ]);

        await prisma.userStats.upsert({
            where: { userId },
            update: {
                todosCompleted: completedTodos,
                updatedAt: new Date(),
            },
            create: {
                userId,
                todosCompleted: completedTodos,
            },
        });
    } catch (error) {
        console.error("Error updating user stats:", error);
    }
}

// Helper function to check and award todo achievements
async function checkAndAwardTodoAchievements(userId: string) {
    try {
        const [totalTodos, completedTodos] = await Promise.all([
            prisma.todo.count({ where: { userId } }),
            prisma.todo.count({ where: { userId, completed: true } }),
        ]);

        // Check for "First Todo" achievement
        if (totalTodos === 1) {
            await awardAchievement(userId, "First Todo");
        }

        // Check for "Todo Master" achievement
        if (completedTodos === 10) {
            await awardAchievement(userId, "Todo Master");
        }

        // Check for "High Priority" achievement
        const highPriorityCompleted = await prisma.todo.count({
            where: {
                userId,
                completed: true,
                priority: "HIGH",
            },
        });

        if (highPriorityCompleted === 5) {
            await awardAchievement(userId, "High Priority");
        }
    } catch (error) {
        console.error("Error checking todo achievements:", error);
    }
}

// Helper function to award an achievement
async function awardAchievement(userId: string, achievementName: string) {
    try {
        const achievement = await prisma.achievement.findUnique({
            where: { name: achievementName },
        });

        if (achievement) {
            // Check if user already has this achievement
            const existingAchievement = await prisma.userAchievement.findFirst({
                where: {
                    userId,
                    achievementId: achievement.id,
                },
            });

            if (!existingAchievement) {
                await prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id,
                        unlockedAt: new Date(),
                        progress: achievement.requirement,
                    },
                });

                // Update user stats
                await prisma.userStats.update({
                    where: { userId },
                    data: {
                        totalPoints: { increment: achievement.points },
                        achievementsUnlocked: { increment: 1 },
                    },
                });
            }
        }
    } catch (error) {
        console.error("Error awarding achievement:", error);
    }
}
