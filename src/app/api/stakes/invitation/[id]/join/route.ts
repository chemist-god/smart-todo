import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";
import { WalletService } from "@/lib/wallet-service";
import { z } from "zod";
import crypto from "crypto";

const joinStakeSchema = z.object({
    amount: z.number().min(1, "Amount must be at least 1 GHS"),
    isSupporter: z.boolean().default(true),
    securityCode: z.string().min(6, "Security code is required")
});

// POST /api/stakes/invitation/[id]/join - Join stake via invitation
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
        const validatedData = joinStakeSchema.parse(body);

        // Get invitation with stake details
        const invitation = await prisma.stakeInvitation.findUnique({
            where: { id },
            include: {
                stake: {
                    include: {
                        participants: true
                    }
                }
            }
        });

        if (!invitation) {
            throw new NotFoundError("Invitation not found");
        }

        // Security validations
        if (invitation.status !== 'PENDING') {
            throw new ValidationError("Invitation is no longer valid");
        }

        if (invitation.expiresAt < new Date()) {
            throw new ValidationError("Invitation has expired");
        }

        if (invitation.stake.status !== 'ACTIVE') {
            throw new ValidationError("Stake is no longer active");
        }

        // Verify security code
        const isValidCode = crypto.timingSafeEqual(
            Buffer.from(invitation.securityCode),
            Buffer.from(validatedData.securityCode)
        );

        if (!isValidCode) {
            throw new ValidationError("Invalid security code");
        }

        // Check if user is trying to join their own stake
        if (invitation.stake.userId === user.id) {
            throw new ValidationError("Cannot join your own stake");
        }

        // Check if user already joined this stake
        const existingParticipant = await prisma.stakeParticipant.findFirst({
            where: {
                stakeId: invitation.stakeId,
                participantId: user.id
            }
        });

        if (existingParticipant) {
            throw new ValidationError("You have already joined this stake");
        }

        // Check if user has sufficient balance
        const wallet = await WalletService.getOrCreateWallet(user.id);
        if (Number(wallet.balance) < validatedData.amount) {
            throw new ValidationError("Insufficient balance");
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct amount from user's wallet
            const newBalance = Number(wallet.balance) - validatedData.amount;
            const newTotalStaked = Number(wallet.totalStaked) + validatedData.amount;

            await tx.userWallet.update({
                where: { userId: user.id },
                data: {
                    balance: newBalance,
                    totalStaked: newTotalStaked
                }
            });

            // Add participant to stake
            const participant = await tx.stakeParticipant.create({
                data: {
                    stakeId: invitation.stakeId,
                    participantId: user.id,
                    participantName: user.name || 'Anonymous',
                    amount: validatedData.amount,
                    isSupporter: validatedData.isSupporter,
                    joinedAt: new Date()
                }
            });

            // Update stake totals
            const currentFriendStakes = Number(invitation.stake.friendStakes);
            const newFriendStakes = currentFriendStakes + validatedData.amount;
            const newTotalAmount = Number(invitation.stake.userStake) + newFriendStakes;

            await tx.stake.update({
                where: { id: invitation.stakeId },
                data: {
                    friendStakes: newFriendStakes,
                    totalAmount: newTotalAmount
                }
            });

            // Update invitation status
            await tx.stakeInvitation.update({
                where: { id },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date()
                }
            });

            // Create wallet transaction record
            await tx.walletTransaction.create({
                data: {
                    walletId: user.wallet.id,
                    userId: user.id,
                    amount: validatedData.amount,
                    type: 'STAKE_PARTICIPATION',
                    description: `Joined stake: ${invitation.stake.title}`
                }
            });

            return {
                participant,
                newBalance,
                newTotalAmount
            };
        });

        // Get updated stake details
        const updatedStake = await prisma.stake.findUnique({
            where: { id: invitation.stakeId },
            include: {
                participants: {
                    select: {
                        id: true,
                        participantName: true,
                        amount: true,
                        isSupporter: true,
                        joinedAt: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: "Successfully joined the stake!",
            stake: {
                id: updatedStake!.id,
                title: updatedStake!.title,
                totalAmount: Number(updatedStake!.totalAmount),
                participantCount: updatedStake!.participants.length,
                participants: updatedStake!.participants
            },
            wallet: {
                balance: result.newBalance,
                totalStaked: Number(wallet.totalStaked) + validatedData.amount
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
