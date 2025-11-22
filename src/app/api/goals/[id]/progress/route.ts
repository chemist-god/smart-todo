import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating progress
const updateProgressSchema = z.object({
  current: z.number().min(0),
  isCompleted: z.boolean().optional(),
});

// PUT /api/goals/[id]/progress - Update goal progress
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
    const { current, isCompleted } = updateProgressSchema.parse(body);

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        milestones: true,
      }
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Update goal progress
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        current,
        isCompleted: isCompleted || current >= goal.target,
      },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Calculate overall progress from milestones
    const totalMilestoneTarget = updatedGoal.milestones.reduce((sum, m) => sum + m.target, 0);
    const totalMilestoneCurrent = updatedGoal.milestones.reduce((sum, m) => sum + (m.current || 0), 0);
    const milestoneProgress = totalMilestoneTarget > 0 ? (totalMilestoneCurrent / totalMilestoneTarget) * 100 : 0;
    
    const goalWithProgress = {
      ...updatedGoal,
      progress: milestoneProgress,
      current: totalMilestoneCurrent,
      isCompleted: milestoneProgress >= 100 || updatedGoal.isCompleted,
    };

    return NextResponse.json(goalWithProgress);
  } catch (error) {
    console.error('Error updating progress:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// POST /api/goals/[id]/progress - Add progress increment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { increment } = z.object({ increment: z.number().min(1) }).parse(body);

    // Check if goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Update goal progress by increment
    const newCurrent = Math.min(goal.current + increment, goal.target);
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        current: newCurrent,
        isCompleted: newCurrent >= goal.target,
      },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Calculate overall progress from milestones
    const totalMilestoneTarget = updatedGoal.milestones.reduce((sum, m) => sum + m.target, 0);
    const totalMilestoneCurrent = updatedGoal.milestones.reduce((sum, m) => sum + (m.current || 0), 0);
    const milestoneProgress = totalMilestoneTarget > 0 ? (totalMilestoneCurrent / totalMilestoneTarget) * 100 : 0;
    
    const goalWithProgress = {
      ...updatedGoal,
      progress: milestoneProgress,
      current: totalMilestoneCurrent,
      isCompleted: milestoneProgress >= 100 || updatedGoal.isCompleted,
    };

    return NextResponse.json(goalWithProgress);
  } catch (error) {
    console.error('Error adding progress:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add progress' },
      { status: 500 }
    );
  }
}
