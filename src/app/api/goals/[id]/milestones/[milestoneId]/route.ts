import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating a milestone
const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  target: z.number().min(1).optional(),
  current: z.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

// Schema for creating a milestone
const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  target: z.number().min(1, 'Target must be at least 1'),
});

// PATCH /api/goals/[id]/milestones/[milestoneId] - Update a milestone
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, milestoneId } = await params;
    const body = await request.json();
    const validatedData = updateMilestoneSchema.parse(body);

    // First verify the goal belongs to the user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Find and update the milestone
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        goalId: id,
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...validatedData,
        // Auto-complete if current reaches or exceeds target
        isCompleted: validatedData.isCompleted ?? (
          (validatedData.current !== undefined && validatedData.current >= milestone.target) ||
          (validatedData.target !== undefined && (milestone.current || 0) >= validatedData.target)
        ),
      },
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id]/milestones/[milestoneId] - Delete a milestone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, milestoneId } = await params;

    // First verify the goal belongs to the user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Find and delete the milestone
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        goalId: id,
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}

// POST /api/goals/[id]/milestones/[milestoneId] - Create a new milestone (alternative endpoint)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = createMilestoneSchema.parse(body);

    // First verify the goal belongs to the user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Create new milestone
    const milestone = await prisma.milestone.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        target: validatedData.target,
        current: 0,
        isCompleted: false,
        goalId: id,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
