import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/achievements - Get all achievements and user progress
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all achievements
        const achievements = await prisma.achievement.findMany({
            orderBy: { createdAt: "asc" },
        });

        // Get user's achievement progress
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: user.id },
            include: {
                achievement: true,
            },
        });

        // Get user stats for progress calculation
        const userStats = await prisma.userStats.findUnique({
            where: { userId: user.id },
        });

        // Combine achievements with user progress
        const achievementsWithProgress = achievements.map((achievement) => {
            const userAchievement = userAchievements.find(
                (ua) => ua.achievementId === achievement.id
            );

            let progress = 0;
            let unlockedAt = null;

            if (userAchievement) {
                progress = userAchievement.progress;
                unlockedAt = userAchievement.unlockedAt;
            } else {
                // Calculate current progress based on user stats
                switch (achievement.name) {
                    case "First Todo":
                        progress = userStats?.todosCompleted || 0;
                        break;
                    case "Todo Master":
                        progress = userStats?.todosCompleted || 0;
                        break;
                    case "Note Taker":
                        progress = userStats?.notesCreated || 0;
                        break;
                    case "Consistent":
                        progress = userStats?.currentStreak || 0;
                        break;
                    case "High Priority":
                        // Count high priority completed todos
                        progress = 0; // Will be calculated separately
                        break;
                    default:
                        progress = 0;
                }
            }

            return {
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                points: achievement.points,
                type: achievement.type,
                requirement: achievement.requirement,
                progress: Math.min(progress, achievement.requirement),
                total: achievement.requirement,
                unlockedAt: unlockedAt,
                isUnlocked: !!unlockedAt,
            };
        });

        return NextResponse.json(achievementsWithProgress);
    } catch (error) {
        console.error("Error fetching achievements:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

