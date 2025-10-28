import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/todos/[id] - Get a specific todo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/todos/[id] - Update a todo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    // Validate data if provided
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      if (data.title.length > 255) {
        return NextResponse.json(
          { error: 'Title must be less than 255 characters' },
          { status: 400 }
        );
      }
    }

    if (data.priority !== undefined) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!validPriorities.includes(data.priority)) {
        return NextResponse.json(
          { error: 'Priority must be LOW, MEDIUM, or HIGH' },
          { status: 400 }
        );
      }
    }

    if (data.dueDate !== undefined && data.dueDate !== null && isNaN(new Date(data.dueDate).getTime())) {
      return NextResponse.json(
        { error: 'Invalid due date format' },
        { status: 400 }
      );
    }

    if (data.scheduledStartTime !== undefined && data.scheduledStartTime !== null && isNaN(new Date(data.scheduledStartTime).getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduled start time format' },
        { status: 400 }
      );
    }

    if (data.scheduledEndTime !== undefined && data.scheduledEndTime !== null && isNaN(new Date(data.scheduledEndTime).getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduled end time format' },
        { status: 400 }
      );
    }

    if (data.estimatedDuration !== undefined && data.estimatedDuration !== null) {
      const duration = parseInt(data.estimatedDuration);
      if (isNaN(duration) || duration < 1 || duration > 480) {
        return NextResponse.json(
          { error: 'Estimated duration must be between 1 and 480 minutes' },
          { status: 400 }
        );
      }
    }

    if (data.totalTimeSpent !== undefined && data.totalTimeSpent !== null) {
      const timeSpent = parseInt(data.totalTimeSpent);
      if (isNaN(timeSpent) || timeSpent < 0) {
        return NextResponse.json(
          { error: 'Total time spent must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    if (data.pomodoroSessions !== undefined && data.pomodoroSessions !== null) {
      const sessions = parseInt(data.pomodoroSessions);
      if (isNaN(sessions) || sessions < 0) {
        return NextResponse.json(
          { error: 'Pomodoro sessions must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Helper function to combine date and time into ISO datetime string
    const combineDateTime = (dateStr: string, timeStr: string): string | null => {
        if (!dateStr || !timeStr) return null;
        try {
            // Create a date object in the user's timezone
            const dateTimeStr = `${dateStr}T${timeStr}`;
            const date = new Date(dateTimeStr);
            // Return ISO string to ensure consistent format
            return date.toISOString();
        } catch (error) {
            console.error('Error combining date and time:', error);
            return null;
        }
    };

    const updatedTodo = await prisma.todo.update({
      where: {
        id,
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.completed !== undefined && {
          completed: data.completed,
          completedAt: data.completed ? new Date() : null
        }),
        // Enhanced scheduling fields - properly combine date and time
        ...(data.scheduledStartTime !== undefined && {
          scheduledStartTime: data.scheduledStartTime ?
            (data.dueDate ?
              combineDateTime(data.dueDate, data.scheduledStartTime) :
              new Date(data.scheduledStartTime)) :
            null
        }),
        ...(data.scheduledEndTime !== undefined && {
          scheduledEndTime: data.scheduledEndTime ?
            (data.dueDate ?
              combineDateTime(data.dueDate, data.scheduledEndTime) :
              new Date(data.scheduledEndTime)) :
            null
        }),
        ...(data.estimatedDuration !== undefined && {
          estimatedDuration: data.estimatedDuration ? parseInt(data.estimatedDuration) : null
        }),
        ...(data.timeZone !== undefined && { timeZone: data.timeZone }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.recurrencePattern !== undefined && { recurrencePattern: data.recurrencePattern }),
        // Timer and focus fields
        ...(data.focusMode !== undefined && { focusMode: data.focusMode }),
        ...(data.breakDuration !== undefined && { breakDuration: data.breakDuration }),
        ...(data.timerStatus !== undefined && { timerStatus: data.timerStatus }),
        ...(data.timerStartTime !== undefined && {
          timerStartTime: data.timerStartTime ? new Date(data.timerStartTime) : null
        }),
        ...(data.totalTimeSpent !== undefined && { totalTimeSpent: data.totalTimeSpent }),
        ...(data.actualDuration !== undefined && { actualDuration: data.actualDuration }),
        ...(data.pomodoroSessions !== undefined && { pomodoroSessions: data.pomodoroSessions }),
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    await prisma.todo.delete({
      where: {
        id,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
