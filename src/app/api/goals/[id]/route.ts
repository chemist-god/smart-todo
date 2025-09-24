import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for goal updates
const updateGoalSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long").optional(),
    description: z.string().optional(),
    target: z.number().min(1, "Target must be at least 1").optional(),
    unit: z.string().min(1, "Unit is required").optional(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
    isCompleted: z.boolean().optional()
});

// GET /api/goals/[id] - Get a specific goal
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const goal = await prisma.goal.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Calculate progress
        const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
        const totalMilestones = goal.milestones.length;

        return NextResponse.json({
            ...goal,
            progress: Math.min(100, Math.round(progress * 100) / 100),
            completedMilestones,
            totalMilestones,
            isOverdue: goal.endDate && new Date(goal.endDate) < new Date() && !goal.isCompleted
        });

    } catch (error) {
        console.error("Error fetching goal:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/goals/[id] - Update a goal
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = updateGoalSchema.parse(body);

        // Check if goal exists and belongs to user
        const existingGoal = await prisma.goal.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!existingGoal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Update the goal
        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                ...validatedData,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
                updatedAt: new Date()
            },
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        // Calculate progress
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

        console.error("Error updating goal:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if goal exists and belongs to user
        const existingGoal = await prisma.goal.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!existingGoal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Delete the goal (milestones will be deleted automatically due to cascade)
        await prisma.goal.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Goal deleted successfully" });

    } catch (error) {
        console.error("Error deleting goal:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
