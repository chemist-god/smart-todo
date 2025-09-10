import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notes - Get all notes for the current user
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "all";
        const search = searchParams.get("search") || "";

        // Build where clause
        const where: Record<string, unknown> = { userId: user.id };
        if (filter !== "all") {
            where.type = filter;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
            ];
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, type } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            );
        }

        const note = await prisma.note.create({
            data: {
                title,
                content,
                type: type || "GENERAL",
                userId: user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update user stats
        await updateUserStats(user.id);

        // Check for achievements
        await checkAndAwardNoteAchievements(user.id);

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error("Error creating note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper function to update user stats
async function updateUserStats(userId: string) {
    try {
        const notesCount = await prisma.note.count({ where: { userId } });

        await prisma.userStats.upsert({
            where: { userId },
            update: {
                notesCreated: notesCount,
                updatedAt: new Date(),
            },
            create: {
                userId,
                notesCreated: notesCount,
            },
        });
    } catch (error) {
        console.error("Error updating user stats:", error);
    }
}

// Helper function to check and award note achievements
async function checkAndAwardNoteAchievements(userId: string) {
    try {
        const notesCount = await prisma.note.count({ where: { userId } });

        // Check for "Note Taker" achievement
        if (notesCount === 1) {
            await awardAchievement(userId, "Note Taker");
        }
    } catch (error) {
        console.error("Error checking note achievements:", error);
    }
}

// Helper function to award an achievement
async function awardAchievement(userId: string, achievementName: string) {
    try {
        const achievement = await prisma.achievement.findUnique({
            where: { name: achievementName },
        });

        if (achievement) {
            // Check if user already has this achievement
            const existingAchievement = await prisma.userAchievement.findFirst({
                where: {
                    userId,
                    achievementId: achievement.id,
                },
            });

            if (!existingAchievement) {
                await prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id,
                        unlockedAt: new Date(),
                        progress: achievement.requirement,
                    },
                });

                // Update user stats
                await prisma.userStats.update({
                    where: { userId },
                    data: {
                        totalPoints: { increment: achievement.points },
                        achievementsUnlocked: { increment: 1 },
                    },
                });
            }
        }
    } catch (error) {
        console.error("Error awarding achievement:", error);
    }
}

