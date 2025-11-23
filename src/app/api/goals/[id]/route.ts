import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating a goal
const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  target: z.number().min(1).optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  deadline: z.string().optional().transform(val => val ? new Date(val) : null),
  isActive: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

// GET /api/goals/[id] - Fetch a single goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Calculate progress
    const totalMilestoneTarget = goal.milestones.reduce((sum, m) => sum + m.target, 0);
    const totalMilestoneCurrent = goal.milestones.reduce((sum, m) => sum + (m.current || 0), 0);
    const progress = totalMilestoneTarget > 0 ? (totalMilestoneCurrent / totalMilestoneTarget) * 100 : 0;
    
    const goalWithProgress = {
      ...goal,
      progress,
      current: totalMilestoneCurrent,
      isCompleted: progress >= 100 || goal.isCompleted,
    };

    return NextResponse.json(goalWithProgress);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateGoalSchema.parse(body);

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: validatedData,
      include: {
        milestones: true,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update goal' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Delete the goal (milestones will be deleted due to cascade)
    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
