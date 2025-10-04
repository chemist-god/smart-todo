import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";
import { WalletService } from "@/lib/wallet-service";
import { RewardCalculator } from "@/lib/reward-calculator";
import { RewardService } from "@/lib/reward-service";

// Zod schema for stake completion
const completeStakeSchema = z.object({
    proof: z.string().min(10, "Proof must be at least 10 characters"),
    completionTime: z.string().optional(),
});

// Zod schema for joining a stake
const joinStakeSchema = z.object({
    amount: z.number().min(1, "Amount must be at least 1 GHS"),
    isSupporter: z.boolean().default(true),
});

// GET /api/stakes/[id] - Get a specific stake
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const stake = await prisma.stake.findFirst({
            where: {
                id,
                OR: [
                    { userId: user.id }, // User's own stake
                    { stakeType: 'SOCIAL_STAKE' } // Or public social stake
                ]
            },
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
                        participantId: true,
                        participantName: true,
                        amount: true,
                        isSupporter: true,
                        joinedAt: true
                    }
                },
                rewards: true,
                penalties: true
            }
        });

        if (!stake) {
            throw new NotFoundError("Stake not found");
        }

        // Calculate additional fields
        const now = new Date();
        const timeRemaining = stake.deadline.getTime() - now.getTime();
        const isOverdue = timeRemaining < 0 && stake.status === 'ACTIVE';
        const progress = timeRemaining > 0 ?
            Math.max(0, Math.min(100, ((stake.deadline.getTime() - now.getTime()) / (stake.deadline.getTime() - stake.createdAt.getTime())) * 100)) : 0;

        // Check if user can join this stake
        const participants = stake.participants || [];
        const canJoin = stake.stakeType === 'SOCIAL_STAKE' &&
            stake.status === 'ACTIVE' &&
            stake.userId !== user.id &&
            !participants.some((p: any) => p.participantId === user.id);

        return NextResponse.json({
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
            participantCount: participants.length,
            totalParticipants: participants.length + 1,
            canJoin,
            isOwner: stake.userId === user.id,
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// POST /api/stakes/[id]/complete - Complete a stake
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = completeStakeSchema.parse(body);

        // Get the stake
        const stake = await prisma.stake.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!stake) {
            throw new NotFoundError("Stake not found");
        }

        // Validate stake completion
        // Validate stake completion before updating
        const stakeData = {
            ...stake,
            totalAmount: Number(stake.totalAmount),
            userStake: Number(stake.userStake),
            friendStakes: Number(stake.friendStakes),
            deadline: stake.deadline,
            completedAt: new Date(validatedData.completionTime || new Date())
        };
        const validation = RewardCalculator.validateStakeCompletion(stakeData, validatedData.proof);
        if (!validation.isValid) {
            throw new ValidationError(validation.errors.join(', '));
        }

        // Update stake status after validation
        const completedAt = new Date(validatedData.completionTime || new Date());
        const updatedStake = await prisma.stake.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completionProof: validatedData.proof,
                completedAt,
                updatedAt: new Date()
            }
        });

        // Process rewards using the reward service
        const rewardResult = await RewardService.processStakeCompletion(stake.id);

        if (!rewardResult.success) {
            throw new Error(rewardResult.error || 'Failed to process rewards');
        }

        // Get updated wallet
        const updatedWallet = await WalletService.getOrCreateWallet(user.id);

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
            },
            reward: {
                amount: rewardResult.totalReward,
                rewards: rewardResult.rewards
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

// POST /api/stakes/[id]/join - Join a social stake
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = joinStakeSchema.parse(body);

        // Get the stake
        const stake = await prisma.stake.findFirst({
            where: {
                id,
                stakeType: 'SOCIAL_STAKE',
                status: 'ACTIVE'
            }
        });

        if (!stake) {
            throw new NotFoundError("Stake not found or not joinable");
        }

        // Check if user is the owner
        if (stake.userId === user.id) {
            throw new ValidationError("Cannot join your own stake");
        }

        // Check if user already joined
        const existingParticipant = await prisma.stakeParticipant.findFirst({
            where: {
                stakeId: id,
                participantId: user.id
            }
        });

        if (existingParticipant) {
            throw new ValidationError("Already joined this stake");
        }

        // Check if user has sufficient balance
        const wallet = await WalletService.getOrCreateWallet(user.id);
        if (Number(wallet.balance) < validatedData.amount) {
            throw new ValidationError("Insufficient balance");
        }

        // Create participant
        const participant = await prisma.stakeParticipant.create({
            data: {
                stakeId: id,
                participantId: user.id,
                participantName: user.name || 'Anonymous',
                amount: validatedData.amount,
                isSupporter: validatedData.isSupporter
            }
        });

        // Update stake total
        const newTotalAmount = Number(stake.totalAmount) + validatedData.amount;
        const newFriendStakes = Number(stake.friendStakes) + validatedData.amount;

        await prisma.stake.update({
            where: { id },
            data: {
                totalAmount: newTotalAmount,
                friendStakes: newFriendStakes
            }
        });

        // Process payment through wallet service
        const updatedWallet = await WalletService.processStakeCreation(
            user.id,
            validatedData.amount,
            stake.id
        );

        return NextResponse.json({
            success: true,
            participant: {
                id: participant.id,
                participantName: participant.participantName,
                amount: Number(participant.amount),
                isSupporter: participant.isSupporter,
                joinedAt: participant.joinedAt
            },
            stake: {
                totalAmount: newTotalAmount,
                friendStakes: newFriendStakes
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

// DELETE /api/stakes/[id] - Cancel a stake
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get the stake
        const stake = await prisma.stake.findFirst({
            where: {
                id,
                userId: user.id,
                status: 'ACTIVE'
            }
        });

        if (!stake) {
            throw new NotFoundError("Stake not found or cannot be cancelled");
        }

        // Check if stake has participants
        const participantCount = await prisma.stakeParticipant.count({
            where: { stakeId: id }
        });

        if (participantCount > 0) {
            throw new ValidationError("Cannot cancel stake with participants");
        }

        // Update stake status
        await prisma.stake.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                updatedAt: new Date()
            }
        });

        // Refund the stake amount
        const wallet = await WalletService.getOrCreateWallet(user.id);
        const refundAmount = Number(stake.userStake);
        const newBalance = Number(wallet.balance) + refundAmount;
        const newTotalStaked = Number(wallet.totalStaked) - refundAmount;

        await WalletService.updateWallet(wallet.id, {
            balance: newBalance,
            totalStaked: newTotalStaked
        });

        // Create refund transaction
        await WalletService.createTransaction({
            walletId: wallet.id,
            userId: user.id,
            type: 'STAKE_REFUND',
            amount: refundAmount,
            description: `Stake cancelled - refund ${refundAmount} GHS`,
            referenceId: stake.id
        });

        return NextResponse.json({
            success: true,
            message: "Stake cancelled successfully",
            refund: {
                amount: refundAmount,
                description: `Refunded ${refundAmount} GHS`
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
