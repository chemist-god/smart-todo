import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get all notifications for the user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get stake notifications
        const stakeNotifications = await fetch(`${request.nextUrl.origin}/api/notifications/stakes?userId=${user.id}`)
            .then(res => res.json())
            .catch(() => ({ notifications: [] }));

        // Get todos for todo notifications
        const todos = await prisma.todo.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const todoNotifications = todos
            .filter(todo => !todo.completed && todo.dueDate !== null)
            .map(todo => {
                // TypeScript guard: we know dueDate is not null from filter above
                if (!todo.dueDate) return null;

                const dueDate = new Date(todo.dueDate);
                const now = new Date();
                const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
                    return {
                        id: `todo-${todo.id}`,
                        type: 'todo' as const,
                        title: 'Todo Due Soon',
                        message: `"${todo.title}" is due in ${Math.round(hoursUntilDue)} hours`,
                        timestamp: now.toISOString(),
                        read: false,
                        priority: hoursUntilDue <= 6 ? 'high' as const : 'medium' as const,
                        actionUrl: `/todos?id=${todo.id}`,
                        metadata: { todoId: todo.id }
                    };
                }
                return null;
            })
            .filter((notification): notification is NonNullable<typeof notification> => notification !== null);

        // Get achievements
        const achievements = await prisma.userAchievement.findMany({
            where: { userId: user.id },
            include: { achievement: true },
            orderBy: { unlockedAt: 'desc' },
            take: 10
        });

        const achievementNotifications = achievements.map(ua => ({
            id: `achievement-${ua.id}`,
            type: 'achievement' as const,
            title: 'Achievement Unlocked!',
            message: `You've unlocked "${ua.achievement.name}"`,
            timestamp: ua.unlockedAt.toISOString(),
            read: false,
            priority: 'medium' as const,
            actionUrl: '/achievements',
            metadata: { achievementId: ua.achievementId }
        }));

        // Combine all notifications
        const allNotifications = [
            ...(stakeNotifications.notifications || []),
            ...todoNotifications,
            ...achievementNotifications
        ];

        // Sort by timestamp (newest first)
        allNotifications.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({ notifications: allNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

