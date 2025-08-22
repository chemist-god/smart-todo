import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/todos/[id] - Get a specific todo
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const todo = await prisma.todo.findFirst({
            where: {
                id: params.id,
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

        if (!todo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }

        return NextResponse.json(todo);
    } catch (error) {
        console.error("Error fetching todo:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, dueDate, priority, completed } = body;

        // Check if todo exists and belongs to user
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id: params.id,
                userId: user.id,
            },
        });

        if (!existingTodo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }

        // Calculate points based on priority
        const pointsMap = {
            LOW: 5,
            MEDIUM: 10,
            HIGH: 15,
        };

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (priority !== undefined) {
            updateData.priority = priority;
            updateData.points = pointsMap[priority as keyof typeof pointsMap] || 10;
        }
        if (completed !== undefined) {
            updateData.completed = completed;
            updateData.completedAt = completed ? new Date() : null;
        }

        const todo = await prisma.todo.update({
            where: { id: params.id },
            data: updateData,
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
        if (completed && !existingTodo.completed) {
            await checkAndAwardAchievements(user.id);
        }

        return NextResponse.json(todo);
    } catch (error) {
        console.error("Error updating todo:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if todo exists and belongs to user
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id: params.id,
                userId: user.id,
            },
        });

        if (!existingTodo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }

        await prisma.todo.delete({
            where: { id: params.id },
        });

        // Update user stats
        await updateUserStats(user.id);

        return NextResponse.json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error("Error deleting todo:", error);
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

// Helper function to check and award achievements
async function checkAndAwardAchievements(userId: string) {
    try {
        const [completedTodos, totalTodos] = await Promise.all([
            prisma.todo.count({ where: { userId, completed: true } }),
            prisma.todo.count({ where: { userId } }),
        ]);

        // Check for "First Todo" achievement
        if (completedTodos === 1) {
            await awardAchievement(userId, "First Todo");
        }

        // Check for "Todo Master" achievement
        if (completedTodos === 10) {
            await awardAchievement(userId, "Todo Master");
        }

        // Check for "High Priority" achievement
        const highPriorityCompleted = await prisma.todo.count({
            where: { userId, completed: true, priority: "HIGH" },
        });
        if (highPriorityCompleted === 5) {
            await awardAchievement(userId, "High Priority");
        }
    } catch (error) {
        console.error("Error checking achievements:", error);
    }
}

// Helper function to award an achievement
async function awardAchievement(userId: string, achievementName: string) {
    try {
        const achievement = await prisma.achievement.findUnique({
            where: { name: achievementName },
        });

        if (achievement) {
            await prisma.userAchievement.upsert({
                where: {
                    userId_achievementId: {
                        userId,
                        achievementId: achievement.id,
                    },
                },
                update: {
                    unlockedAt: new Date(),
                    progress: achievement.requirement,
                },
                create: {
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
    } catch (error) {
        console.error("Error awarding achievement:", error);
    }
}

