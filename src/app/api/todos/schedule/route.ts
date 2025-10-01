import { NextResponse, NextRequest } from "next/server";
import { auth } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

// GET /api/todos/schedule - Get scheduled todos for a date range
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
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const timeZone = searchParams.get("timeZone") || Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'Start date and end date are required' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Get scheduled todos in the date range
        const scheduledTodos = await prisma.todo.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    {
                        scheduledStartTime: {
                            gte: start,
                            lte: end,
                        },
                    },
                    {
                        scheduledEndTime: {
                            gte: start,
                            lte: end,
                        },
                    },
                    {
                        dueDate: {
                            gte: start,
                            lte: end,
                        },
                    },
                ],
            },
            orderBy: [
                { scheduledStartTime: 'asc' },
                { dueDate: 'asc' },
            ],
            include: {
                timerSessions: {
                    where: {
                        startTime: {
                            gte: start,
                            lte: end,
                        },
                    },
                    orderBy: { startTime: 'asc' },
                },
            },
        });

        return NextResponse.json(scheduledTodos);
    } catch (error) {
        console.error("Error fetching scheduled todos:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/todos/schedule - Create recurring todos
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
        const {
            baseTodoId,
            recurrencePattern,
            endDate,
            timeZone
        } = data;

        if (!baseTodoId || !recurrencePattern) {
            return NextResponse.json(
                { error: 'Base todo ID and recurrence pattern are required' },
                { status: 400 }
            );
        }

        // Get the base todo
        const baseTodo = await prisma.todo.findFirst({
            where: {
                id: baseTodoId,
                userId: session.user.id,
            },
        });

        if (!baseTodo) {
            return NextResponse.json(
                { error: 'Base todo not found' },
                { status: 404 }
            );
        }

        const createdTodos = [];
        const startDate = new Date(baseTodo.scheduledStartTime || baseTodo.dueDate || new Date());
        const endRecurrence = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

        let currentDate = new Date(startDate);

        // Generate recurring todos based on pattern
        while (currentDate <= endRecurrence) {
            if (currentDate.getTime() !== startDate.getTime()) { // Skip the original todo
                const newTodo = await prisma.todo.create({
                    data: {
                        title: baseTodo.title,
                        description: baseTodo.description,
                        priority: baseTodo.priority,
                        points: baseTodo.points,
                        userId: session.user.id,
                        dueDate: baseTodo.dueDate ? new Date(currentDate) : null,
                        scheduledStartTime: baseTodo.scheduledStartTime ? new Date(currentDate) : null,
                        scheduledEndTime: baseTodo.scheduledEndTime ? new Date(currentDate) : null,
                        estimatedDuration: baseTodo.estimatedDuration,
                        timeZone: timeZone || baseTodo.timeZone,
                        isRecurring: true,
                        recurrencePattern: recurrencePattern,
                        reminderSettings: baseTodo.reminderSettings || undefined,
                    },
                });
                createdTodos.push(newTodo);
            }

            // Calculate next occurrence
            switch (recurrencePattern) {
                case 'DAILY':
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case 'WEEKLY':
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case 'MONTHLY':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
                default:
                    return NextResponse.json(
                        { error: 'Invalid recurrence pattern' },
                        { status: 400 }
                    );
            }
        }

        return NextResponse.json({
            message: `Created ${createdTodos.length} recurring todos`,
            todos: createdTodos,
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating recurring todos:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
