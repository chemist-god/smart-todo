import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for progress updates
const updateProgressSchema = z.object({
    current: z.number().min(0, "Current progress cannot be negative"),
    milestoneId: z.string().optional() // If updating a specific milestone
});

// PUT /api/goals/[id]/progress - Update goal progress
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
        const validatedData = updateProgressSchema.parse(body);

        // Check if goal exists and belongs to user
        const goal = await prisma.goal.findFirst({
            where: {
                id: params.id,
                userId: user.id
            },
            include: {
                milestones: true
            }
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Update goal progress
        const updatedGoal = await prisma.goal.update({
            where: { id: params.id },
            data: {
                current: Math.min(validatedData.current, goal.target), // Don't exceed target
                updatedAt: new Date()
            },
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        // Check if goal is now completed
        const isCompleted = updatedGoal.current >= updatedGoal.target;
        if (isCompleted && !updatedGoal.isCompleted) {
            await prisma.goal.update({
                where: { id: params.id },
                data: { isCompleted: true }
            });
        }

        // Update milestone if specified
        if (validatedData.milestoneId) {
            const milestone = goal.milestones.find(m => m.id === validatedData.milestoneId);
            if (milestone) {
                const milestoneProgress = Math.min(validatedData.current, milestone.target);
                const isMilestoneCompleted = milestoneProgress >= milestone.target;

                await prisma.milestone.update({
                    where: { id: validatedData.milestoneId },
                    data: {
                        current: milestoneProgress,
                        isCompleted: isMilestoneCompleted
                    }
                });
            }
        }

        // Recalculate progress
        const progress = updatedGoal.target > 0 ? (updatedGoal.current / updatedGoal.target) * 100 : 0;
        const completedMilestones = updatedGoal.milestones.filter(m => m.isCompleted).length;
        const totalMilestones = updatedGoal.milestones.length;

        return NextResponse.json({
            ...updatedGoal,
            progress: Math.min(100, Math.round(progress * 100) / 100),
            completedMilestones,
            totalMilestones,
            isOverdue: updatedGoal.endDate && new Date(updatedGoal.endDate) < new Date() && !updatedGoal.isCompleted
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Error updating goal progress:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/goals/[id]/progress - Auto-update progress based on goal type
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if goal exists and belongs to user
        const goal = await prisma.goal.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        let newProgress = 0;

        // Calculate progress based on goal type
        switch (goal.type) {
            case 'TASKS_COMPLETED':
                const completedTodos = await prisma.todo.count({
                    where: {
                        userId: user.id,
                        completed: true,
                        completedAt: {
                            gte: goal.startDate,
                            lte: goal.endDate || new Date()
                        }
                    }
                });
                newProgress = completedTodos;
                break;

            case 'POINTS_EARNED':
                const completedTodosForPoints = await prisma.todo.findMany({
                    where: {
                        userId: user.id,
                        completed: true,
                        completedAt: {
                            gte: goal.startDate,
                            lte: goal.endDate || new Date()
                        }
                    },
                    select: { points: true }
                });
                newProgress = completedTodosForPoints.reduce((sum, todo) => sum + todo.points, 0);
                break;

            case 'STREAK_DAYS':
                const userStats = await prisma.userStats.findUnique({
                    where: { userId: user.id }
                });
                newProgress = userStats?.currentStreak || 0;
                break;

            case 'NOTES_CREATED':
                const notesCount = await prisma.note.count({
                    where: {
                        userId: user.id,
                        createdAt: {
                            gte: goal.startDate,
                            lte: goal.endDate || new Date()
                        }
                    }
                });
                newProgress = notesCount;
                break;

            case 'ACHIEVEMENTS_UNLOCKED':
                const achievementsCount = await prisma.userAchievement.count({
                    where: {
                        userId: user.id,
                        unlockedAt: {
                            gte: goal.startDate,
                            lte: goal.endDate || new Date()
                        }
                    }
                });
                newProgress = achievementsCount;
                break;

            default:
                return NextResponse.json(
                    { error: "Auto-progress not supported for this goal type" },
                    { status: 400 }
                );
        }

        // Update goal progress
        const updatedGoal = await prisma.goal.update({
            where: { id: params.id },
            data: {
                current: Math.min(newProgress, goal.target),
                updatedAt: new Date()
            },
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        // Check if goal is now completed
        const isCompleted = updatedGoal.current >= updatedGoal.target;
        if (isCompleted && !updatedGoal.isCompleted) {
            await prisma.goal.update({
                where: { id: params.id },
                data: { isCompleted: true }
            });
        }

        // Recalculate progress
        const progress = updatedGoal.target > 0 ? (updatedGoal.current / updatedGoal.target) * 100 : 0;
        const completedMilestones = updatedGoal.milestones.filter(m => m.isCompleted).length;
        const totalMilestones = updatedGoal.milestones.length;

        return NextResponse.json({
            ...updatedGoal,
            progress: Math.min(100, Math.round(progress * 100) / 100),
            completedMilestones,
            totalMilestones,
            isOverdue: updatedGoal.endDate && new Date(updatedGoal.endDate) < new Date() && !updatedGoal.isCompleted
        });

    } catch (error) {
        console.error("Error auto-updating goal progress:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
