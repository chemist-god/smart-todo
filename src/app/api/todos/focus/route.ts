import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getRecommendedFocusTasks } from '@/lib/prioritization';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
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
    console.error('Error fetching focus tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
