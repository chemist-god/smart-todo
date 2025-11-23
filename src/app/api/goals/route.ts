import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a goal
const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  target: z.number().min(1, 'Target must be at least 1'),
  unit: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['TASKS_COMPLETED', 'POINTS_EARNED', 'STREAK_DAYS', 'NOTES_CREATED', 'ACHIEVEMENTS_UNLOCKED', 'CUSTOM']).default('CUSTOM'),
  endDate: z.string().optional().transform(val => val ? new Date(val) : null),
  startDate: z.string().transform(val => val ? new Date(val) : new Date()),
  milestones: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    target: z.number().min(1),
  })).optional(),
});

// GET /api/goals - Fetch all goals for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {
      userId: user.id,
    };

    if (status === 'active') {
      where.isActive = true;
      where.isCompleted = false;
    } else if (status === 'completed') {
      where.isCompleted = true;
    }

    if (type && type !== 'all') {
      where.category = type;
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { isCompleted: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Calculate progress for each goal
    const goalsWithProgress = goals.map(goal => {
      const totalMilestoneTarget = goal.milestones.reduce((sum, m) => sum + m.target, 0);
      const totalMilestoneCurrent = goal.milestones.reduce((sum, m) => sum + (m.current || 0), 0);
      const progress = totalMilestoneTarget > 0 ? (totalMilestoneCurrent / totalMilestoneTarget) * 100 : 0;

      return {
        ...goal,
        progress,
        current: totalMilestoneCurrent,
        isCompleted: progress >= 100 || goal.isCompleted,
      };
    });

    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGoalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        target: validatedData.target,
        unit: validatedData.unit || 'units',
        type: validatedData.type,
        endDate: validatedData.endDate,
        startDate: validatedData.startDate,
        userId: user.id,
        milestones: validatedData.milestones ? {
          create: validatedData.milestones.map(milestone => ({
            title: milestone.title,
            description: milestone.description,
            target: milestone.target,
            current: 0,
            isCompleted: false,
          }))
        } : undefined,
      },
      include: {
        milestones: true,
      },
    });

    // Calculate progress for the created goal
    const totalMilestoneTarget = goal.milestones.reduce((sum, m) => sum + m.target, 0);
    const totalMilestoneCurrent = goal.milestones.reduce((sum, m) => sum + (m.current || 0), 0);
    const progress = totalMilestoneTarget > 0 ? (totalMilestoneCurrent / totalMilestoneTarget) * 100 : 0;

    const goalWithProgress = {
      ...goal,
      progress,
      current: totalMilestoneCurrent,
      isCompleted: progress >= 100 || goal.isCompleted,
    };

    return NextResponse.json(goalWithProgress, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
