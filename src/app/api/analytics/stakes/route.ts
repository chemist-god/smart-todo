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
        const timeRange = searchParams.get('timeRange') || '30d';
        const userId = searchParams.get('userId') || user.id;

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Get all stakes for the user
        const stakes = await prisma.stake.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate
                }
            },
            include: {
                participants: true,
                rewards: true,
                penalties: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate basic stats
        const totalStakes = stakes.length;
        const activeStakes = stakes.filter(s => s.status === 'ACTIVE').length;
        const completedStakes = stakes.filter(s => s.status === 'COMPLETED').length;
        const failedStakes = stakes.filter(s => s.status === 'FAILED').length;

        const successRate = totalStakes > 0 ? Math.round((completedStakes / totalStakes) * 100) : 0;

        // Calculate financial stats
        const totalEarned = stakes
            .filter(s => s.status === 'COMPLETED')
            .reduce((sum, stake) => {
                const rewards = stake.rewards.reduce((rewardSum, reward) => rewardSum + Number(reward.amount), 0);
                return sum + Number(stake.userStake) + rewards;
            }, 0);

        const totalLost = stakes
            .filter(s => s.status === 'FAILED')
            .reduce((sum, stake) => sum + Number(stake.userStake), 0);

        const averageStakeAmount = totalStakes > 0 ?
            stakes.reduce((sum, stake) => sum + Number(stake.userStake), 0) / totalStakes : 0;

        const totalParticipants = stakes.reduce((sum, stake) => sum + stake.participants.length, 0);

        // Generate monthly data
        const monthlyData = [];
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(date);
        }

        for (const month of months) {
            const monthStakes = stakes.filter(stake => {
                const stakeDate = new Date(stake.createdAt);
                return stakeDate.getFullYear() === month.getFullYear() &&
                    stakeDate.getMonth() === month.getMonth();
            });

            const completed = monthStakes.filter(s => s.status === 'COMPLETED').length;
            const failed = monthStakes.filter(s => s.status === 'FAILED').length;
            const earned = monthStakes
                .filter(s => s.status === 'COMPLETED')
                .reduce((sum, stake) => {
                    const rewards = stake.rewards.reduce((rewardSum, reward) => rewardSum + Number(reward.amount), 0);
                    return sum + Number(stake.userStake) + rewards;
                }, 0);

            monthlyData.push({
                month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                completed,
                failed,
                earned
            });
        }

        // Stake type breakdown
        const stakeTypeBreakdown = [
            { type: 'SELF_STAKE', count: 0, successRate: 0 },
            { type: 'SOCIAL_STAKE', count: 0, successRate: 0 },
            { type: 'CHALLENGE_STAKE', count: 0, successRate: 0 },
            { type: 'TEAM_STAKE', count: 0, successRate: 0 },
            { type: 'CHARITY_STAKE', count: 0, successRate: 0 }
        ];

        stakeTypeBreakdown.forEach(typeData => {
            const typeStakes = stakes.filter(s => s.stakeType === typeData.type);
            typeData.count = typeStakes.length;
            if (typeStakes.length > 0) {
                const completed = typeStakes.filter(s => s.status === 'COMPLETED').length;
                typeData.successRate = Math.round((completed / typeStakes.length) * 100);
            }
        });

        // Recent activity
        const recentActivity = stakes.slice(0, 10).map(stake => ({
            id: stake.id,
            title: stake.title,
            status: stake.status,
            amount: Number(stake.userStake),
            date: stake.createdAt.toISOString()
        }));

        const analyticsData = {
            totalStakes,
            activeStakes,
            completedStakes,
            failedStakes,
            totalEarned,
            totalLost,
            successRate,
            averageStakeAmount,
            totalParticipants,
            monthlyData,
            stakeTypeBreakdown,
            recentActivity
        };

        return NextResponse.json(analyticsData);

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
