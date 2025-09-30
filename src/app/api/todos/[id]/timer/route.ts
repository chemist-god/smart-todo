import { NextResponse, NextRequest } from "next/server";
import { auth } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

// PATCH /api/todos/[id]/timer - Update timer status and time tracking
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const todoId = params.id;
        const data = await request.json();

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

        // Update timer-related fields
        const updatedTodo = await prisma.todo.update({
            where: { id: todoId },
            data: {
                timerStatus: data.timerStatus,
                timerStartTime: data.timerStartTime ? new Date(data.timerStartTime) : null,
                totalTimeSpent: data.totalTimeSpent,
                actualDuration: data.actualDuration,
                focusMode: data.focusMode,
                pomodoroSessions: data.pomodoroSessions,
                breakDuration: data.breakDuration,
            },
        });

        return NextResponse.json(updatedTodo);
    } catch (error) {
        console.error("Error updating timer:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/todos/[id]/timer/session - Create a new timer session
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const todoId = params.id;
        const data = await request.json();

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

        // Create timer session
        const timerSession = await prisma.timerSession.create({
            data: {
                todoId: todoId,
                startTime: new Date(data.startTime),
                endTime: data.endTime ? new Date(data.endTime) : null,
                duration: data.duration,
                sessionType: data.sessionType || 'FOCUS',
                notes: data.notes,
            },
        });

        // Update todo's total time spent
        const totalTimeSpent = await prisma.timerSession.aggregate({
            where: { todoId },
            _sum: { duration: true },
        });

        await prisma.todo.update({
            where: { id: todoId },
            data: {
                totalTimeSpent: totalTimeSpent._sum.duration || 0,
            },
        });

        return NextResponse.json(timerSession, { status: 201 });
    } catch (error) {
        console.error("Error creating timer session:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// GET /api/todos/[id]/timer/sessions - Get timer sessions for a todo
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const todoId = params.id;

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

        // Get timer sessions
        const sessions = await prisma.timerSession.findMany({
            where: { todoId },
            orderBy: { startTime: 'desc' },
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Error fetching timer sessions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
