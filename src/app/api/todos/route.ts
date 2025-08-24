import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/todos - Get all todos for the current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "all";
        const sortBy = searchParams.get("sortBy") || "created";

        // Build where clause
        let where: any = { userId: user.id };
        if (filter === "active") {
            where.completed = false;
        } else if (filter === "completed") {
            where.completed = true;
        }

        // Build order by clause
        let orderBy: any = {};
        switch (sortBy) {
            case "due":
                orderBy.dueDate = "asc";
                break;
            case "priority":
                orderBy.priority = "desc";
                break;
            default:
                orderBy.createdAt = "desc";
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
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, dueDate, priority } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
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
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || "MEDIUM",
                points: pointsMap[priority as keyof typeof pointsMap] || 10,
                userId: user.id,
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
        await updateUserStats(user.id);

        // Check for achievements
        await checkAndAwardTodoAchievements(user.id);

        return NextResponse.json(todo, { status: 201 });
    } catch (error) {
        console.error("Error creating todo:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper function to update user stats
async function updateUserStats(userId: string) {
    try {
        const [totalTodos, completedTodos] = await Promise.all([
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

