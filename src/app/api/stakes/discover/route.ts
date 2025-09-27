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
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || 'all';
        const difficulty = searchParams.get('difficulty') || 'all';
        const sortBy = searchParams.get('sortBy') || 'popularity';

        // Build where clause
        const where: any = {
            stakeType: 'SOCIAL_STAKE',
            status: 'ACTIVE',
            NOT: {
                userId: user.id // Exclude user's own stakes
            }
        };

        // Add search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Add category filter (only if category field exists)
        if (category !== 'all') {
            // For now, we'll filter in memory since category field might not exist yet
            // where.category = category;
        }

        // Add difficulty filter (only if difficulty field exists)
        if (difficulty !== 'all') {
            // For now, we'll filter in memory since difficulty field might not exist yet
            // where.difficulty = difficulty;
        }

        // Build orderBy clause - use safe fields that definitely exist
        let orderBy: any = { createdAt: 'desc' };

        switch (sortBy) {
            case 'deadline':
                orderBy = { deadline: 'asc' };
                break;
            case 'amount':
                orderBy = { totalAmount: 'desc' };
                break;
            case 'participants':
                // We'll calculate this in memory since participantCount doesn't exist in DB
                orderBy = { createdAt: 'desc' };
                break;
            case 'success':
                // We'll calculate this in memory since successRate doesn't exist in DB
                orderBy = { createdAt: 'desc' };
                break;
            case 'popularity':
            default:
                // Use createdAt for now, we'll calculate popularity in memory
                orderBy = { createdAt: 'desc' };
                break;
        }

        // Get stakes with related data
        const stakes = await prisma.stake.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        amount: true,
                        isSupporter: true
                    }
                }
            },
            orderBy,
            take: 50 // Limit results
        });

        // Calculate additional fields for each stake
        const now = new Date();
        let stakesWithCalculations = stakes.map(stake => {
            const timeRemaining = stake.deadline.getTime() - now.getTime();
            const isOverdue = timeRemaining < 0;
            const progress = timeRemaining > 0 ?
                Math.max(0, Math.min(100, ((stake.deadline.getTime() - now.getTime()) / (stake.deadline.getTime() - stake.createdAt.getTime())) * 100)) : 0;

            const participantCount = stake.participants.length;
            const totalParticipants = participantCount + 1; // +1 for creator
            const canJoin = !isOverdue && stake.status === 'ACTIVE';

            // Calculate popularity based on engagement
            const popularity = participantCount * 10 + Math.floor(Math.random() * 100);

            // Calculate success rate (mock for now)
            const successRate = Math.floor(Math.random() * 40) + 60;

            return {
                id: stake.id,
                title: stake.title,
                description: stake.description,
                stakeType: stake.stakeType,
                status: stake.status,
                totalAmount: Number(stake.totalAmount),
                userStake: Number(stake.userStake),
                friendStakes: Number(stake.friendStakes),
                deadline: stake.deadline.toISOString(),
                createdAt: stake.createdAt.toISOString(),
                timeRemaining: Math.max(0, timeRemaining),
                isOverdue,
                progress: Math.round(progress),
                participantCount,
                totalParticipants,
                canJoin,
                isOwner: false, // These are not user's own stakes
                creator: {
                    id: stake.user.id,
                    name: stake.user.name || 'Anonymous',
                    image: stake.user.image
                },
                category: 'personal', // Default category (we'll enhance this)
                difficulty: 'MEDIUM', // Default difficulty (we'll enhance this)
                tags: [], // Default empty tags (we'll enhance this)
                popularity,
                successRate
            };
        });

        // Apply in-memory filtering
        if (category !== 'all') {
            stakesWithCalculations = stakesWithCalculations.filter(stake =>
                stake.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (difficulty !== 'all') {
            stakesWithCalculations = stakesWithCalculations.filter(stake =>
                stake.difficulty.toLowerCase() === difficulty.toLowerCase()
            );
        }

        // Apply in-memory sorting
        switch (sortBy) {
            case 'deadline':
                stakesWithCalculations.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                break;
            case 'amount':
                stakesWithCalculations.sort((a, b) => b.totalAmount - a.totalAmount);
                break;
            case 'participants':
                stakesWithCalculations.sort((a, b) => b.participantCount - a.participantCount);
                break;
            case 'success':
                stakesWithCalculations.sort((a, b) => b.successRate - a.successRate);
                break;
            case 'popularity':
            default:
                stakesWithCalculations.sort((a, b) => b.popularity - a.popularity);
                break;
        }

        return NextResponse.json({
            stakes: stakesWithCalculations,
            total: stakesWithCalculations.length
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
