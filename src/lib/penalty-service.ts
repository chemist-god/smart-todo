import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";
import { RewardCalculator } from "@/lib/reward-calculator";

export interface EnhancedPenaltyResult {
    success: boolean;
    penaltyAmount: number;
    refunds: Array<{
        userId: string;
        amount: number;
        reason: string;
    }>;
    gracePeriodApplied?: boolean;
    partialCompletion?: {
        percentage: number;
        adjustedPenalty: number;
    };
    error?: string;
}

export interface GracePeriodConfig {
    durationHours: number;
    notificationSent: boolean;
}

export interface PartialCompletionConfig {
    minimumPercentage: number; // Minimum % to qualify for partial completion
    penaltyReduction: number; // % reduction in penalty for partial completion
}

export class PenaltyService {
    private static readonly GRACE_PERIOD_HOURS = 1;
    private static readonly PARTIAL_COMPLETION_MINIMUM = 25; // 25% minimum
    private static readonly PARTIAL_COMPLETION_PENALTY_REDUCTION = 0.5; // 50% penalty reduction

    /**
     * Process penalty for a failed stake with enhanced features
     */
    static async processStakeFailure(stakeId: string, completionPercentage?: number): Promise<EnhancedPenaltyResult> {
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

            if (stake.status !== 'FAILED' && (stake as any).status !== 'PARTIALLY_COMPLETED') {
                throw new Error("Stake is not in a failed state");
            }

            const isPartialCompletion = completionPercentage && completionPercentage >= this.PARTIAL_COMPLETION_MINIMUM;
            const basePenaltyAmount = Number(stake.userStake);

            // Calculate adjusted penalty for partial completion
            let adjustedPenalty = basePenaltyAmount;
            if (isPartialCompletion) {
                const penaltyReduction = basePenaltyAmount * this.PARTIAL_COMPLETION_PENALTY_REDUCTION;
                adjustedPenalty = basePenaltyAmount - penaltyReduction;
            }

            const refunds = [];

            // Create penalty record
            await prisma.penalty.create({
                data: {
                    stakeId: stake.id,
                    userId: stake.userId,
                    amount: adjustedPenalty,
                    reason: isPartialCompletion
                        ? `Partial completion (${completionPercentage}%) - reduced penalty`
                        : 'Stake not completed on time',
                    appliedAt: new Date()
                }
            });

            // Update stake with completion percentage if partial
            if (isPartialCompletion) {
                await prisma.stake.update({
                    where: { id: stake.id },
                    data: {
                        status: 'PARTIALLY_COMPLETED' as any,
                        completionPercentage: completionPercentage!,
                        penaltyAmount: adjustedPenalty
                    }
                });
            }

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
                    description: isPartialCompletion
                        ? 'Refund for partially completed stake'
                        : 'Refund for failed stake',
                    referenceId: stake.id
                });

                refunds.push({
                    userId: participant.participantId,
                    amount: refundAmount,
                    reason: isPartialCompletion
                        ? 'Refund for partially completed stake'
                        : 'Refund for failed stake'
                });
            }

            // Update user streak (partial reset for partial completion)
            await this.updateUserStreak(stake.userId, false, !!isPartialCompletion);

            return {
                success: true,
                penaltyAmount: adjustedPenalty,
                refunds,
                partialCompletion: isPartialCompletion ? {
                    percentage: completionPercentage!,
                    adjustedPenalty
                } : undefined
            };

        } catch (error) {
            console.error('Error processing enhanced stake failure:', error);
            return {
                success: false,
                penaltyAmount: 0,
                refunds: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Check for overdue stakes and apply grace period
     */
    static async processOverdueStakes(): Promise<{
        processed: number;
        gracePeriodApplied: number;
        failures: string[];
        partialCompletions: string[];
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
            const partialCompletions = [];
            let processed = 0;
            let gracePeriodApplied = 0;

            for (const stake of overdueStakes) {
                try {
                    // Check if grace period has already been applied
                    if (!(stake as any).gracePeriodEnd) {
                        // Apply grace period
                        const gracePeriodEnd = new Date(now.getTime() + (this.GRACE_PERIOD_HOURS * 60 * 60 * 1000));

                        await prisma.stake.update({
                            where: { id: stake.id },
                            data: {
                                status: 'GRACE_PERIOD' as any,
                                gracePeriodEnd: gracePeriodEnd,
                                updatedAt: new Date()
                            }
                        });

                        gracePeriodApplied++;

                        // Send notification about grace period
                        await this.sendGracePeriodNotification(stake);

                    } else if ((stake as any).gracePeriodEnd && now > (stake as any).gracePeriodEnd) {
                        // Grace period has expired, process as failed
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
                            if (penaltyResult.partialCompletion) {
                                partialCompletions.push(stake.id);
                            }
                        } else {
                            failures.push(stake.id);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing overdue stake ${stake.id}:`, error);
                    failures.push(stake.id);
                }
            }

            return { processed, gracePeriodApplied, failures, partialCompletions };

        } catch (error) {
            console.error('Error processing overdue stakes:', error);
            return { processed: 0, gracePeriodApplied: 0, failures: [], partialCompletions: [] };
        }
    }

    /**
     * Process partial completion of a stake
     */
    static async processPartialCompletion(
        stakeId: string,
        completionPercentage: number,
        evidence?: string
    ): Promise<EnhancedPenaltyResult> {
        try {
            const stake = await prisma.stake.findUnique({
                where: { id: stakeId }
            });

            if (!stake) {
                throw new Error("Stake not found");
            }

            if (stake.status !== 'ACTIVE' && (stake as any).status !== 'GRACE_PERIOD') {
                throw new Error("Stake is not active");
            }

            if (completionPercentage < this.PARTIAL_COMPLETION_MINIMUM) {
                throw new Error(`Completion percentage must be at least ${this.PARTIAL_COMPLETION_MINIMUM}%`);
            }

            // Update stake with partial completion
            await prisma.stake.update({
                where: { id: stakeId },
                data: {
                    status: 'PARTIALLY_COMPLETED' as any,
                    completionPercentage: completionPercentage,
                    completionProof: evidence || `Partial completion: ${completionPercentage}%`,
                    completedAt: new Date()
                }
            });

            // Process penalty with partial completion
            const result = await this.processStakeFailure(stakeId, completionPercentage);

            return result;

        } catch (error) {
            console.error('Error processing partial completion:', error);
            return {
                success: false,
                penaltyAmount: 0,
                refunds: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Send grace period notification
     */
    private static async sendGracePeriodNotification(stake: any): Promise<void> {
        // This would integrate with your notification service
        console.log(`Grace period applied for stake: ${stake.title}`);
        // TODO: Implement actual notification sending
    }

    /**
     * Update user streak with partial completion consideration
     */
    private static async updateUserStreak(userId: string, success: boolean, isPartialCompletion: boolean = false): Promise<void> {
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
        } else if (isPartialCompletion) {
            // Partial completion - reduce streak by half instead of resetting
            const newStreak = Math.max(0, Math.floor(wallet.currentStreak / 2));
            await prisma.userWallet.update({
                where: { userId },
                data: {
                    currentStreak: newStreak
                }
            });
        } else {
            // Complete failure - reset streak
            await prisma.userWallet.update({
                where: { userId },
                data: {
                    currentStreak: 0
                }
            });
        }
    }

    /**
     * Get grace period statistics
     */
    static async getGracePeriodStats(): Promise<{
        activeGracePeriods: number;
        gracePeriodSuccessRate: number;
        averageGracePeriodDuration: number;
    }> {
        const now = new Date();

        const activeGracePeriods = await prisma.stake.count({
            where: {
                status: 'GRACE_PERIOD',
                gracePeriodEnd: {
                    gt: now
                }
            }
        });

        const gracePeriodStakes = await prisma.stake.findMany({
            where: {
                status: {
                    in: ['GRACE_PERIOD' as any, 'COMPLETED', 'FAILED', 'PARTIALLY_COMPLETED' as any]
                },
                gracePeriodEnd: {
                    not: null
                }
            },
            select: {
                status: true,
                gracePeriodEnd: true,
                deadline: true
            }
        });

        const completedAfterGrace = gracePeriodStakes.filter(s =>
            s.status === 'COMPLETED' || (s as any).status === 'PARTIALLY_COMPLETED'
        ).length;

        const gracePeriodSuccessRate = gracePeriodStakes.length > 0
            ? (completedAfterGrace / gracePeriodStakes.length) * 100
            : 0;

        const averageGracePeriodDuration = gracePeriodStakes.length > 0
            ? gracePeriodStakes.reduce((sum, stake) => {
                if ((stake as any).gracePeriodEnd) {
                    return sum + ((stake as any).gracePeriodEnd.getTime() - stake.deadline.getTime());
                }
                return sum;
            }, 0) / gracePeriodStakes.length / (1000 * 60 * 60) // Convert to hours
            : 0;

        return {
            activeGracePeriods,
            gracePeriodSuccessRate,
            averageGracePeriodDuration
        };
    }
}
