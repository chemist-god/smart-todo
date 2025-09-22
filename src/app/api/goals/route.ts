import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for goal creation
const createGoalSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    description: z.string().optional(),
    type: z.enum(["TASKS_COMPLETED", "POINTS_EARNED", "STREAK_DAYS", "NOTES_CREATED", "ACHIEVEMENTS_UNLOCKED", "CUSTOM"]),
    target: z.number().min(1, "Target must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    milestones: z.array(z.object({
        title: z.string().min(1, "Milestone title is required"),
        description: z.string().optional(),
        target: z.number().min(1, "Milestone target must be at least 1")
    })).optional()
});

// GET /api/goals - Get all goals for the user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if Prisma client is properly initialized
        if (!prisma) {
            console.error("Prisma client not initialized");
            return NextResponse.json({ error: "Database connection error" }, { status: 500 });
        }

        // Check if Goal model exists
        if (!prisma.goal) {
            console.error("Goal model not found in Prisma client");
            console.log("Available Prisma models:", Object.keys(prisma));
            return NextResponse.json({
                error: "Database schema error - Goal model not found",
                availableModels: Object.keys(prisma),
                suggestion: "Please run 'npx prisma generate' and 'npx prisma db push' to sync the schema"
            }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // active, completed, all
        const type = searchParams.get('type');

        const where: any = { userId: user.id };

        if (status === 'active') {
            where.isActive = true;
            where.isCompleted = false;
        } else if (status === 'completed') {
            where.isCompleted = true;
        }

        if (type) {
            where.type = type;
        }

        const goals = await prisma.goal.findMany({
            where,
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: [
                { isCompleted: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        // Calculate progress for each goal
        const goalsWithProgress = goals.map(goal => {
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
            const totalMilestones = goal.milestones.length;

            return {
                ...goal,
                progress: Math.min(100, Math.round(progress * 100) / 100),
                completedMilestones,
                totalMilestones,
                isOverdue: goal.endDate && new Date(goal.endDate) < new Date() && !goal.isCompleted
            };
        });

        return NextResponse.json(goalsWithProgress);

    } catch (error) {
        console.error("Error fetching goals:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if Prisma client is properly initialized
        if (!prisma) {
            console.error("Prisma client not initialized");
            return NextResponse.json({ error: "Database connection error" }, { status: 500 });
        }

        // Check if Goal model exists
        if (!prisma.goal) {
            console.error("Goal model not found in Prisma client");
            console.log("Available Prisma models:", Object.keys(prisma));
            return NextResponse.json({
                error: "Database schema error - Goal model not found",
                availableModels: Object.keys(prisma),
                suggestion: "Please run 'npx prisma generate' and 'npx prisma db push' to sync the schema"
            }, { status: 500 });
        }

        const body = await request.json();
        const validatedData = createGoalSchema.parse(body);

        // Create the goal
        const goal = await prisma.goal.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                type: validatedData.type,
                target: validatedData.target,
                unit: validatedData.unit,
                startDate: new Date(validatedData.startDate),
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
                userId: user.id
            }
        });

        // Create milestones if provided
        if (validatedData.milestones && validatedData.milestones.length > 0) {
            await prisma.milestone.createMany({
                data: validatedData.milestones.map(milestone => ({
                    title: milestone.title,
                    description: milestone.description,
                    target: milestone.target,
                    goalId: goal.id
                }))
            });
        }

        // Fetch the complete goal with milestones
        const completeGoal = await prisma.goal.findUnique({
            where: { id: goal.id },
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        return NextResponse.json(completeGoal, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Error creating goal:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
