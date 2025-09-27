import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";

export interface PenaltyResult {
    success: boolean;
    penaltyAmount: number;
    refunds: Array<{
        userId: string;
        amount: number;
        reason: string;
    }>;
    error?: string;
}

export class PenaltyService {
    /**
     * Process penalty for a failed stake
     */
    static async processStakeFailure(stakeId: string): Promise<PenaltyResult> {
        try {
            const stake = await prisma.stake.findUnique({
                where: { id: stakeId },
                include: {
                    user: true,
                    participants: true
                }
            });

            if (!stake) {
                throw new Error("Stake not found");
            }

            if (stake.status !== 'FAILED') {
                throw new Error("Stake is not failed");
            }

            const penaltyAmount = Number(stake.userStake);
            const refunds = [];

            // Create penalty record
            await prisma.penalty.create({
                data: {
                    stakeId: stake.id,
                    userId: stake.userId,
                    amount: penaltyAmount,
                    reason: 'Stake not completed on time',
                    appliedAt: new Date()
                }
            });

            // Refund participants
            for (const participant of stake.participants) {
                const refundAmount = Number(participant.amount);

                // Get participant's wallet and add refund amount
                const participantWallet = await WalletService.getOrCreateWallet(participant.participantId);
                const newBalance = Number(participantWallet.balance) + refundAmount;

                await WalletService.updateWallet(participantWallet.id, {
                    balance: newBalance
                });

                // Create refund transaction
                await WalletService.createTransaction({
                    walletId: participantWallet.id,
                    userId: participant.participantId,
                    type: 'STAKE_REFUND',
                    amount: refundAmount,
                    description: 'Refund for failed stake',
                    referenceId: stake.id
                });

                refunds.push({
                    userId: participant.participantId,
                    amount: refundAmount,
                    reason: 'Refund for failed stake'
                });
            }

            // Update user streak (reset to 0)
            await this.updateUserStreak(stake.userId, false);

            return {
                success: true,
                penaltyAmount,
                refunds
            };

        } catch (error) {
            console.error('Error processing stake failure:', error);
            return {
                success: false,
                penaltyAmount: 0,
                refunds: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Check for overdue stakes and process failures
     */
    static async processOverdueStakes(): Promise<{
        processed: number;
        failures: string[];
    }> {
        try {
            const now = new Date();

            // Find overdue active stakes
            const overdueStakes = await prisma.stake.findMany({
                where: {
                    status: 'ACTIVE',
                    deadline: {
                        lt: now
                    }
                }
            });

            const failures = [];
            let processed = 0;

            for (const stake of overdueStakes) {
                try {
                    // Update stake status to failed
                    await prisma.stake.update({
                        where: { id: stake.id },
                        data: {
                            status: 'FAILED',
                            updatedAt: new Date()
                        }
                    });

                    // Process penalty
                    const penaltyResult = await this.processStakeFailure(stake.id);

                    if (penaltyResult.success) {
                        processed++;
                    } else {
                        failures.push(stake.id);
                    }
                } catch (error) {
                    console.error(`Error processing overdue stake ${stake.id}:`, error);
                    failures.push(stake.id);
                }
            }

            return { processed, failures };

        } catch (error) {
            console.error('Error processing overdue stakes:', error);
            return { processed: 0, failures: [] };
        }
    }

    /**
     * Get penalty statistics for a user
     */
    static async getUserPenaltyStats(userId: string): Promise<{
        totalPenalties: number;
        totalPenaltyAmount: number;
        recentPenalties: Array<{
            id: string;
            amount: number;
            reason: string;
            appliedAt: Date;
            stakeTitle: string;
        }>;
    }> {
        const penalties = await prisma.penalty.findMany({
            where: { userId },
            include: {
                stake: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { appliedAt: 'desc' },
            take: 10
        });

        const totalPenalties = penalties.length;
        const totalPenaltyAmount = penalties.reduce((sum, penalty) => sum + Number(penalty.amount), 0);

        const recentPenalties = penalties.map(penalty => ({
            id: penalty.id,
            amount: Number(penalty.amount),
            reason: penalty.reason,
            appliedAt: penalty.appliedAt,
            stakeTitle: penalty.stake.title
        }));

        return {
            totalPenalties,
            totalPenaltyAmount,
            recentPenalties
        };
    }

    /**
     * Update user streak
     */
    private static async updateUserStreak(userId: string, success: boolean): Promise<void> {
        const wallet = await WalletService.getOrCreateWallet(userId);

        if (success) {
            // Increment streak
            await prisma.userWallet.update({
                where: { userId },
                data: {
                    currentStreak: wallet.currentStreak + 1,
                    longestStreak: Math.max(wallet.longestStreak, wallet.currentStreak + 1)
                }
            });
        } else {
            // Reset streak
            await prisma.userWallet.update({
                where: { userId },
                data: {
                    currentStreak: 0
                }
            });
        }
    }
}
