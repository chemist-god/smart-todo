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
            console.warn('Goals API: Unauthorized access attempt');
            return NextResponse.json(
                { error: "Unauthorized", message: "Please log in to access your goals" },
                { status: 401 }
            );
        }

        // Check if Prisma client is properly initialized
        if (!prisma) {
            console.error("Goals API: Prisma client not initialized");
            return NextResponse.json(
                { error: "Database connection error", message: "Service temporarily unavailable" },
                { status: 500 }
            );
        }

        // Check if Goal model exists
        if (!prisma.goal) {
            console.error("Goals API: Goal model not found in Prisma client");
            return NextResponse.json({
                error: "Database schema error",
                message: "Database configuration issue. Please contact support."
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

        if (type && type !== 'all') {
            where.type = type;
        }

        console.log(`Goals API: Fetching goals for user ${user.id} with filters:`, { status, type });

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
            const progress = goal.target > 0 ? ((goal.current ?? 0) / goal.target) * 100 : 0;
            const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
            const totalMilestones = goal.milestones.length;

            return {
                ...goal,
                current: goal.current ?? 0, // Ensure current always has a value
                progress: Math.min(100, Math.round(progress * 100) / 100),
                completedMilestones,
                totalMilestones,
                isOverdue: goal.endDate && new Date(goal.endDate) < new Date() && !goal.isCompleted
            };
        });

        console.log(`Goals API: Returning ${goalsWithProgress.length} goals for user ${user.id}`);

        return NextResponse.json(goalsWithProgress);

    } catch (error) {
        console.error("Goals API: Error fetching goals:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "Failed to load goals. Please try again later."
            },
            { status: 500 }
        );
    }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            console.warn('Goals API: Unauthorized goal creation attempt');
            return NextResponse.json(
                { error: "Unauthorized", message: "Please log in to create goals" },
                { status: 401 }
            );
        }

        // Check if Prisma client is properly initialized
        if (!prisma) {
            console.error("Goals API: Prisma client not initialized");
            return NextResponse.json(
                { error: "Database connection error", message: "Service temporarily unavailable" },
                { status: 500 }
            );
        }

        // Check if Goal model exists
        if (!prisma.goal) {
            console.error("Goals API: Goal model not found in Prisma client");
            return NextResponse.json({
                error: "Database schema error",
                message: "Database configuration issue. Please contact support."
            }, { status: 500 });
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            console.warn('Goals API: Invalid JSON in request body');
            return NextResponse.json(
                { error: "Invalid request", message: "Request body must be valid JSON" },
                { status: 400 }
            );
        }

        let validatedData;
        try {
            validatedData = createGoalSchema.parse(body);
        } catch (error) {
            console.warn('Goals API: Validation failed for goal creation:', error);
            return NextResponse.json(
                { error: "Validation error", details: error instanceof Error ? error.message : 'Invalid data provided' },
                { status: 400 }
            );
        }

        console.log(`Goals API: Creating goal for user ${user.id}:`, validatedData.title);

        // Create the goal in a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            const goal = await tx.goal.create({
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
                await tx.milestone.createMany({
                    data: validatedData.milestones.map(milestone => ({
                        title: milestone.title,
                        description: milestone.description,
                        target: milestone.target,
                        goalId: goal.id
                    }))
                });
            }

            return goal;
        });

        // Fetch the complete goal with milestones
        const completeGoal = await prisma.goal.findUnique({
            where: { id: result.id },
            include: {
                milestones: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!completeGoal) {
            console.error('Goals API: Failed to fetch created goal');
            return NextResponse.json(
                { error: "Creation failed", message: "Goal was created but could not be retrieved" },
                { status: 500 }
            );
        }

        console.log(`Goals API: Successfully created goal ${completeGoal.id} for user ${user.id}`);

        return NextResponse.json(completeGoal, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn('Goals API: Zod validation error:', error.issues);
            return NextResponse.json(
                { error: "Validation error", details: error.issues, message: "Please check your input data" },
                { status: 400 }
            );
        }

        console.error("Goals API: Error creating goal:", error);
        return NextResponse.json(
            { error: "Internal server error", message: "Failed to create goal. Please try again." },
            { status: 500 }
        );
    }
}
