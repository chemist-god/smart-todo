import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";
import { WalletService } from "@/lib/wallet-service";
import { RewardCalculator } from "@/lib/reward-calculator";

// Zod schema for stake creation
const createStakeSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().optional(),
    stakeType: z.enum(["SELF_STAKE", "SOCIAL_STAKE", "CHALLENGE_STAKE", "TEAM_STAKE", "CHARITY_STAKE"]),
    amount: z.number().min(5, "Minimum stake amount is 5 GHS").max(1000, "Maximum stake amount is 1000 GHS"),
    deadline: z.string().min(1, "Deadline is required"),
    taskId: z.string().optional(),
    proofRequired: z.boolean().default(true),
    allowFriends: z.boolean().default(false),
});

// Zod schema for stake updates
const updateStakeSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
    description: z.string().optional(),
    deadline: z.string().min(1, "Deadline is required").optional(),
    proofRequired: z.boolean().optional(),
    allowFriends: z.boolean().optional(),
});

// GET /api/stakes - Get user's stakes
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as any;
        const type = searchParams.get('type') as any;
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build where clause
        const where: any = { userId: user.id };

        if (status) {
            where.status = status;
        }

        if (type) {
            where.stakeType = type;
        }

        // Get stakes with pagination
        const [stakes, total] = await Promise.all([
            prisma.stake.findMany({
                where,
                include: {
                    participants: {
                        select: {
                            id: true,
                            participantName: true,
                            amount: true,
                            isSupporter: true,
                            joinedAt: true
                        }
                    },
                    rewards: {
                        select: {
                            id: true,
                            amount: true,
                            rewardType: true,
                            description: true,
                            awardedAt: true
                        }
                    },
                    penalties: {
                        select: {
                            id: true,
                            amount: true,
                            reason: true,
                            appliedAt: true
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                take: limit,
                skip: offset
            }),
            prisma.stake.count({ where })
        ]);

        // Calculate additional fields for each stake
        const stakesWithCalculations = stakes.map(stake => {
            const now = new Date();
            const timeRemaining = stake.deadline.getTime() - now.getTime();
            const isOverdue = timeRemaining < 0 && stake.status === 'ACTIVE';
            const progress = timeRemaining > 0 ?
                Math.max(0, Math.min(100, ((stake.deadline.getTime() - now.getTime()) / (stake.deadline.getTime() - stake.createdAt.getTime())) * 100)) : 0;

            return {
                ...stake,
                totalAmount: Number(stake.totalAmount),
                userStake: Number(stake.userStake),
                friendStakes: Number(stake.friendStakes),
                penaltyAmount: Number(stake.penaltyAmount),
                rewardAmount: Number(stake.rewardAmount),
                penaltyPool: Number(stake.penaltyPool),
                timeRemaining: Math.max(0, timeRemaining),
                isOverdue,
                progress: Math.round(progress),
                participantCount: stake.participants.length,
                totalParticipants: stake.participants.length + 1, // +1 for the creator
            };
        });

        return NextResponse.json({
            stakes: stakesWithCalculations,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// POST /api/stakes - Create a new stake
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createStakeSchema.parse(body);

        // Validate deadline
        const deadline = new Date(validatedData.deadline);
        const now = new Date();
        const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        const maxDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        if (deadline < minDeadline) {
            throw new ValidationError("Deadline must be at least 24 hours from now");
        }

        if (deadline > maxDeadline) {
            throw new ValidationError("Deadline cannot be more than 30 days from now");
        }

        // Process stake creation through wallet service
        const updatedWallet = await WalletService.processStakeCreation(
            user.id,
            validatedData.amount,
            'temp' // Will be updated after stake creation
        );

        // Create the stake
        const stake = await prisma.stake.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                stakeType: validatedData.stakeType,
                status: 'ACTIVE',
                totalAmount: validatedData.amount,
                userStake: validatedData.amount,
                friendStakes: 0,
                penaltyAmount: RewardCalculator.calculatePenaltyAmount(validatedData.amount, validatedData.stakeType),
                deadline,
                taskId: validatedData.taskId,
                userId: user.id,
            },
            include: {
                participants: true,
                rewards: true,
                penalties: true
            }
        });

        // Update the transaction with the actual stake ID
        await prisma.walletTransaction.updateMany({
            where: {
                walletId: updatedWallet.id,
                referenceId: 'temp'
            },
            data: {
                referenceId: stake.id
            }
        });

        // Calculate additional fields
        const currentTime = new Date();
        const timeRemaining = stake.deadline.getTime() - currentTime.getTime();
        const progress = timeRemaining > 0 ?
            Math.max(0, Math.min(100, ((stake.deadline.getTime() - currentTime.getTime()) / (stake.deadline.getTime() - stake.createdAt.getTime())) * 100)) : 0;

        return NextResponse.json({
            success: true,
            stake: {
                ...stake,
                totalAmount: Number(stake.totalAmount),
                userStake: Number(stake.userStake),
                friendStakes: Number(stake.friendStakes),
                penaltyAmount: Number(stake.penaltyAmount),
                rewardAmount: Number(stake.rewardAmount),
                penaltyPool: Number(stake.penaltyPool),
                timeRemaining: Math.max(0, timeRemaining),
                isOverdue: false,
                progress: Math.round(progress),
                participantCount: 0,
                totalParticipants: 1,
            },
            wallet: {
                balance: Number(updatedWallet.balance),
                totalEarned: Number(updatedWallet.totalEarned),
                totalLost: Number(updatedWallet.totalLost),
                totalStaked: Number(updatedWallet.totalStaked),
            }
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// PUT /api/stakes - Update a stake (only if not started)
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { stakeId, ...updateData } = body;

        if (!stakeId) {
            throw new ValidationError("Stake ID is required");
        }

        const validatedData = updateStakeSchema.parse(updateData);

        // Check if stake exists and belongs to user
        const existingStake = await prisma.stake.findFirst({
            where: {
                id: stakeId,
                userId: user.id
            }
        });

        if (!existingStake) {
            throw new NotFoundError("Stake not found");
        }

        // Only allow updates if stake is active and no participants
        if (existingStake.status !== 'ACTIVE') {
            throw new ValidationError("Cannot update completed or failed stake");
        }

        const participantCount = await prisma.stakeParticipant.count({
            where: { stakeId }
        });

        if (participantCount > 0) {
            throw new ValidationError("Cannot update stake with participants");
        }

        // Update the stake
        const updatedStake = await prisma.stake.update({
            where: { id: stakeId },
            data: {
                ...validatedData,
                deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
                updatedAt: new Date()
            },
            include: {
                participants: true,
                rewards: true,
                penalties: true
            }
        });

        return NextResponse.json({
            success: true,
            stake: {
                ...updatedStake,
                totalAmount: Number(updatedStake.totalAmount),
                userStake: Number(updatedStake.userStake),
                friendStakes: Number(updatedStake.friendStakes),
                penaltyAmount: Number(updatedStake.penaltyAmount),
                rewardAmount: Number(updatedStake.rewardAmount),
                penaltyPool: Number(updatedStake.penaltyPool),
            }
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
