import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || user.id;

        // Get user's stakes
        const stakes = await prisma.stake.findMany({
            where: { userId },
            include: {
                participants: true,
                rewards: true,
                penalties: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate notifications based on stake data
        const notifications = [];

        for (const stake of stakes) {
            const now = new Date();
            const deadline = new Date(stake.deadline);
            const timeRemaining = deadline.getTime() - now.getTime();
            const hoursRemaining = timeRemaining / (1000 * 60 * 60);

            // Deadline notifications
            if (stake.status === 'ACTIVE') {
                if (hoursRemaining <= 24 && hoursRemaining > 0) {
                    notifications.push({
                        id: `deadline-${stake.id}-24h`,
                        type: 'deadline',
                        title: 'Deadline Approaching',
                        message: `"${stake.title}" deadline is in ${Math.round(hoursRemaining)} hours`,
                        timestamp: now.toISOString(),
                        read: false,
                        stakeId: stake.id
                    });
                }

                if (hoursRemaining <= 2 && hoursRemaining > 0) {
                    notifications.push({
                        id: `deadline-${stake.id}-2h`,
                        type: 'deadline',
                        title: 'Urgent: Deadline Soon',
                        message: `"${stake.title}" deadline is in ${Math.round(hoursRemaining * 60)} minutes`,
                        timestamp: now.toISOString(),
                        read: false,
                        stakeId: stake.id
                    });
                }

                if (timeRemaining < 0) {
                    notifications.push({
                        id: `deadline-${stake.id}-overdue`,
                        type: 'deadline',
                        title: 'Stake Overdue',
                        message: `"${stake.title}" deadline has passed. Complete it now to avoid penalties!`,
                        timestamp: now.toISOString(),
                        read: false,
                        stakeId: stake.id
                    });
                }
            }

            // Completion notifications
            if (stake.status === 'COMPLETED') {
                const totalReward = stake.rewards.reduce((sum, reward) => sum + Number(reward.amount), 0);
                notifications.push({
                    id: `completed-${stake.id}`,
                    type: 'achievement',
                    title: 'Stake Completed!',
                    message: `Congratulations! You completed "${stake.title}" and earned ₵${totalReward.toFixed(2)}`,
                    timestamp: stake.completedAt?.toISOString() || now.toISOString(),
                    read: false,
                    stakeId: stake.id,
                    amount: totalReward
                });
            }

            // Failure notifications
            if (stake.status === 'FAILED') {
                notifications.push({
                    id: `failed-${stake.id}`,
                    type: 'penalty',
                    title: 'Stake Failed',
                    message: `"${stake.title}" was not completed on time. Penalty: ₵${Number(stake.userStake).toFixed(2)}`,
                    timestamp: now.toISOString(),
                    read: false,
                    stakeId: stake.id,
                    amount: Number(stake.userStake)
                });
            }

            // Social stake notifications
            if (stake.stakeType === 'SOCIAL_STAKE' && stake.participants.length > 0) {
                const recentParticipants = stake.participants.filter(p => {
                    const joinedAt = new Date(p.joinedAt);
                    const hoursSinceJoined = (now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60);
                    return hoursSinceJoined <= 24;
                });

                for (const participant of recentParticipants) {
                    notifications.push({
                        id: `social-${stake.id}-${participant.id}`,
                        type: 'social',
                        title: 'New Stake Participant',
                        message: `${participant.participantName} joined your stake "${stake.title}" with ₵${Number(participant.amount).toFixed(2)}`,
                        timestamp: participant.joinedAt.toISOString(),
                        read: false,
                        stakeId: stake.id,
                        amount: Number(participant.amount)
                    });
                }
            }
        }

        // Sort notifications by timestamp (newest first)
        notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({
            notifications: notifications.slice(0, 50) // Limit to 50 most recent
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
