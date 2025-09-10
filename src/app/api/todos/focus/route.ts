import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRecommendedFocusTasks } from '@/lib/prioritization';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all user's active todos
    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        completed: false, // Only include incomplete tasks
      },
      orderBy: [
        { dueDate: 'asc' }, // Earlier due dates first
        { priority: 'desc' }, // Higher priority first
      ],
    });

    // Get recommended focus tasks
    const focusTasks = getRecommendedFocusTasks(todos);

    return NextResponse.json(focusTasks);
  } catch (error) {
    console.error('Error in /api/todos/focus:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
