import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";
import { WalletService } from "@/lib/wallet-service";
import { RewardCalculator } from "@/lib/reward-calculator";
import {
    parseDeadlineToUTC,
    validateDeadlineRange,
} from "@/lib/timezone-utils";
import crypto from "crypto";

// Zod schema for stake creation
const createStakeSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().optional(),
    stakeType: z.enum(["SELF_STAKE", "SOCIAL_STAKE", "CHALLENGE_STAKE", "TEAM_STAKE", "CHARITY_STAKE"]),
    amount: z.number().min(5, "Minimum stake amount is ₵5").max(1000, "Maximum stake amount is ₵1000"),
    deadline: z.string().min(1, "Deadline is required"),
    taskId: z.string().optional(),
    proofRequired: z.boolean().default(true),
    allowFriends: z.boolean().default(false),
    category: z.string().optional(),
    difficulty: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

// Zod schema for stake updates
const updateStakeSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
    description: z.string().optional(),
    deadline: z.string().min(1, "Deadline is required").optional(),
    proofRequired: z.boolean().optional(),
    allowFriends: z.boolean().optional(),
    category: z.string().optional(),
    difficulty: z.string().optional(),
    tags: z.array(z.string()).optional(),
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
                isOwner: stake.userId === user.id, // Add isOwner field
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

        // Parse and validate deadline with timezone handling
        let deadline: Date;
        try {
            deadline = parseDeadlineToUTC(validatedData.deadline);
        } catch (error) {
            throw new ValidationError(
                error instanceof Error ? error.message : "Invalid deadline format"
            );
        }

        // Validate deadline range with flexible constraints
        // Allows user-defined intervals (1 hour minimum, 90 days maximum)
        const deadlineValidation = validateDeadlineRange(
            deadline,
            1,   // Minimum 1 hour from now (flexible)
            90   // Maximum 90 days from now (reasonable upper bound)
        );
        if (!deadlineValidation.isValid) {
            throw new ValidationError(deadlineValidation.error || "Invalid deadline");
        }

        // Execute all operations within a single transaction for atomicity
        // This ensures that if any step fails, all changes are rolled back
        const result = await prisma.$transaction(async (tx) => {
            // Step 1: Process wallet deduction within transaction
            // This will throw if insufficient balance, causing transaction rollback
            const updatedWallet = await WalletService.processStakeCreationInTransaction(
                tx,
                user.id,
                validatedData.amount,
                'temp' // Will be updated after stake creation
            );

            // Step 2: Create the stake within transaction
            const stake = await tx.stake.create({
                data: {
                    title: validatedData.title,
                    description: validatedData.description,
                    stakeType: validatedData.stakeType,
                    status: 'ACTIVE',
                    totalAmount: validatedData.amount,
                    userStake: validatedData.amount,
                    friendStakes: 0,
                    penaltyAmount: RewardCalculator.calculatePenaltyAmount(
                        validatedData.amount,
                        validatedData.stakeType
                    ),
                    deadline,
                    taskId: validatedData.taskId,
                    userId: user.id,
                    category: validatedData.category || 'personal',
                    difficulty: validatedData.difficulty || 'MEDIUM',
                    tags: validatedData.tags && validatedData.tags.length > 0
                        ? validatedData.tags.join(', ')
                        : null,
                    popularity: 0,
                    viewCount: 0,
                    joinCount: 0,
                    shareCount: 0,
                },
                include: {
                    participants: true,
                    rewards: true,
                    penalties: true
                }
            });

            // Step 3: Update the transaction reference with actual stake ID
            const updateResult = await tx.walletTransaction.updateMany({
                where: {
                    walletId: updatedWallet.id,
                    referenceId: 'temp'
                },
                data: {
                    referenceId: stake.id
                }
            });

            // Verify that the transaction was updated
            // This prevents silent failures where the transaction isn't linked
            if (updateResult.count === 0) {
                throw new Error(
                    "Failed to link wallet transaction to stake. " +
                    "This should not happen - transaction may have been created outside of this flow."
                );
            }

            // Step 4: Pre-generate public invitation for SOCIAL_STAKE (if applicable)
            // This is done within the transaction but errors are handled gracefully
            let publicInvitation = null;
            if (validatedData.stakeType === 'SOCIAL_STAKE') {
                try {
                    const securityCode = crypto.randomBytes(6).toString('hex').toUpperCase();
                    publicInvitation = await tx.stakeInvitation.create({
                        data: {
                            stakeId: stake.id,
                            inviterId: user.id,
                            inviteeEmail: 'public@share.com', // Placeholder for public shares
                            message: `Join my stake: "${validatedData.title}" for ₵${validatedData.amount}`,
                            status: 'PENDING',
                            securityCode,
                            expiresAt: new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after deadline
                        },
                        select: {
                            id: true,
                            securityCode: true
                        }
                    });
                } catch (error) {
                    // Log error but don't fail the transaction
                    // Invitation creation is not critical for stake creation
                    console.error('Error creating public invitation within transaction:', error);
                    // Continue without invitation - user can create it later
                }
            }

            return {
                stake,
                wallet: updatedWallet,
                publicInvitation
            };
        });

        // Calculate additional fields for response
        const currentTime = new Date();
        const timeRemaining = result.stake.deadline.getTime() - currentTime.getTime();
        const progress = timeRemaining > 0
            ? Math.max(
                0,
                Math.min(
                    100,
                    ((result.stake.deadline.getTime() - currentTime.getTime()) /
                        (result.stake.deadline.getTime() - result.stake.createdAt.getTime())) *
                    100
                )
            )
            : 0;

        return NextResponse.json({
            success: true,
            stake: {
                ...result.stake,
                totalAmount: Number(result.stake.totalAmount),
                userStake: Number(result.stake.userStake),
                friendStakes: Number(result.stake.friendStakes),
                penaltyAmount: Number(result.stake.penaltyAmount),
                rewardAmount: Number(result.stake.rewardAmount),
                penaltyPool: Number(result.stake.penaltyPool),
                timeRemaining: Math.max(0, timeRemaining),
                isOverdue: false,
                progress: Math.round(progress),
                participantCount: 0,
                totalParticipants: 1,
                // Include securityCode for SOCIAL_STAKE shares
                securityCode: result.publicInvitation?.securityCode || null,
            },
            wallet: {
                balance: Number(result.wallet.balance),
                totalEarned: Number(result.wallet.totalEarned),
                totalLost: Number(result.wallet.totalLost),
                totalStaked: Number(result.wallet.totalStaked),
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
                tags: validatedData.tags && validatedData.tags.length > 0 ? validatedData.tags.join(', ') : null,
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
