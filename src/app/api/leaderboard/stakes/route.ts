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

        // Get all users with their stake statistics
        const users = await prisma.user.findMany({
            include: {
                wallet: true,
                stakes: {
                    include: {
                        rewards: true,
                        penalties: true
                    }
                }
            }
        });

        // Calculate leaderboard data for each user
        const leaderboardUsers = users.map(user => {
            const completedStakes = user.stakes.filter(s => s.status === 'COMPLETED');
            const totalStakes = user.stakes.length;
            const totalEarned = completedStakes.reduce((sum, stake) => {
                const rewards = stake.rewards.reduce((rewardSum, reward) => rewardSum + Number(reward.amount), 0);
                return sum + Number(stake.userStake) + rewards;
            }, 0);
            const successRate = totalStakes > 0 ? Math.round((completedStakes.length / totalStakes) * 100) : 0;

            // Calculate badges
            const badges = [];
            if (user.wallet?.currentStreak >= 10) badges.push('STREAK_MASTER');
            if (totalEarned >= 1000) badges.push('HIGH_EARNER');
            if (successRate >= 90) badges.push('PERFECTIONIST');
            if (user.stakes.filter(s => s.stakeType === 'SOCIAL_STAKE').length >= 5) badges.push('SOCIAL_BUTTERFLY');

            return {
                id: user.id,
                name: user.name || 'Anonymous',
                image: user.image,
                totalEarned,
                totalStakes,
                successRate,
                currentStreak: user.wallet?.currentStreak || 0,
                longestStreak: user.wallet?.longestStreak || 0,
                badges,
                isCurrentUser: user.id === userId
            };
        });

        // Sort by different criteria
        const topEarners = [...leaderboardUsers]
            .sort((a, b) => b.totalEarned - a.totalEarned)
            .slice(0, 20)
            .map((user, index) => ({ ...user, rank: index + 1 }));

        const topPerformers = [...leaderboardUsers]
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 20)
            .map((user, index) => ({ ...user, rank: index + 1 }));

        const topStreaks = [...leaderboardUsers]
            .sort((a, b) => b.longestStreak - a.longestStreak)
            .slice(0, 20)
            .map((user, index) => ({ ...user, rank: index + 1 }));

        // Get recent winners (users who completed stakes in the last 24 hours)
        const recentWinners = await prisma.stake.findMany({
            where: {
                status: 'COMPLETED',
                completedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { completedAt: 'desc' },
            take: 6
        });

        const recentWinnersData = recentWinners.map(stake => ({
            id: stake.user.id,
            name: stake.user.name || 'Anonymous',
            image: stake.user.image,
            totalEarned: 0, // We don't need this for recent winners
            totalStakes: 0,
            successRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            isCurrentUser: stake.user.id === userId
        }));

        // Calculate totals
        const totalUsers = users.length;
        const totalStakes = users.reduce((sum, user) => sum + user.stakes.length, 0);
        const totalEarned = users.reduce((sum, user) => {
            const completedStakes = user.stakes.filter(s => s.status === 'COMPLETED');
            return sum + completedStakes.reduce((stakeSum, stake) => {
                const rewards = stake.rewards.reduce((rewardSum, reward) => rewardSum + Number(reward.amount), 0);
                return stakeSum + Number(stake.userStake) + rewards;
            }, 0);
        }, 0);

        const leaderboardData = {
            topEarners,
            topPerformers,
            topStreaks,
            recentWinners: recentWinnersData,
            totalUsers,
            totalStakes,
            totalEarned
        };

        return NextResponse.json(leaderboardData);

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
