import { NextResponse, NextRequest } from "next/server";
import { auth } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

// GET /api/todos/focus - Get todos in focus mode
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get todos currently in focus mode
    const focusTodos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
        focusMode: true,
        completed: false,
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledStartTime: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        timerSessions: {
          where: {
            endTime: null, // Active sessions
          },
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(focusTodos);
  } catch (error) {
    console.error("Error fetching focus todos:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/todos/focus - Enable focus mode for a todo
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { todoId, enable } = data;

    if (!todoId) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    // Verify todo belongs to user
    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        userId: session.user.id,
      },
    });

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Update focus mode
    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        focusMode: enable,
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Error updating focus mode:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}