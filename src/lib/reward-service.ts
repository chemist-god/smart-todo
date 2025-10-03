import { prisma } from "@/lib/prisma";
import { RewardCalculator, StakeData, UserStreakData } from "@/lib/reward-calculator";
import { WalletService } from "@/lib/wallet-service";
import { RewardType } from "@prisma/client";

export interface RewardDistributionResult {
    success: boolean;
    totalReward: number;
    rewards: Array<{
        userId: string;
        amount: number;
        rewardType: string;
        description: string;
    }>;
    error?: string;
}

export class RewardService {
    /**
     * Process reward distribution for a completed stake
     */
    static async processStakeCompletion(stakeId: string): Promise<RewardDistributionResult> {
        try {
            // Get stake with all related data
            const stake = await prisma.stake.findUnique({
                where: { id: stakeId },
                include: {
                    user: true,
                    participants: true,
                    rewards: true
                }
            });

            if (!stake) {
                throw new Error("Stake not found");
            }

            if (stake.status !== 'COMPLETED') {
                throw new Error("Stake is not completed");
            }

            // Get user streak data
            const userStreak = await this.getUserStreakData(stake.userId);

            // Calculate rewards based on stake type
            let rewardCalculation;
            const stakeData: StakeData = {
                id: stake.id,
                stakeType: stake.stakeType as any,
                status: stake.status as any,
                totalAmount: Number(stake.totalAmount),
                userStake: Number(stake.userStake),
                friendStakes: Number(stake.friendStakes),
                deadline: stake.deadline,
                completedAt: stake.completedAt || undefined
            };

            switch (stake.stakeType) {
                case 'SELF_STAKE':
                    rewardCalculation = RewardCalculator.calculateSelfStakeReward(
                        Number(stake.userStake),
                        userStreak
                    );
                    break;
                case 'SOCIAL_STAKE':
                    rewardCalculation = RewardCalculator.calculateSocialStakeReward(
                        Number(stake.totalAmount),
                        Number(stake.userStake)
                    );
                    break;
                case 'CHALLENGE_STAKE':
                    // Challenge stakes use self stake calculation (personal achievement)
                    rewardCalculation = RewardCalculator.calculateSelfStakeReward(
                        Number(stake.userStake),
                        userStreak
                    );
                    break;
                case 'TEAM_STAKE':
                    // Team stakes use social stake calculation (shared rewards)
                    rewardCalculation = RewardCalculator.calculateSocialStakeReward(
                        Number(stake.totalAmount),
                        Number(stake.userStake)
                    );
                    break;
                case 'CHARITY_STAKE':
                    // Charity stakes use social stake calculation (winner takes all)
                    rewardCalculation = RewardCalculator.calculateSocialStakeReward(
                        Number(stake.totalAmount),
                        Number(stake.userStake)
                    );
                    break;
                default:
                    throw new Error("Unknown stake type");
            }

            // Distribute rewards
            const rewards = await this.distributeRewards(stake, rewardCalculation);

            // Update user streak
            await this.updateUserStreak(stake.userId, true);

            return {
                success: true,
                totalReward: rewardCalculation.totalReward,
                rewards
            };

        } catch (error) {
            console.error('Error processing stake completion:', error);
            return {
                success: false,
                totalReward: 0,
                rewards: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process penalty for a failed stake
     */
    static async processStakeFailure(stakeId: string): Promise<RewardDistributionResult> {
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

            // Calculate penalties
            const penaltyAmount = Number(stake.userStake);

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

            // Update user streak
            await this.updateUserStreak(stake.userId, false);

            // Refund participants if any
            const participantRefunds = [];
            for (const participant of stake.participants) {
                // Get participant's wallet and add refund amount
                const participantWallet = await WalletService.getOrCreateWallet(participant.participantId);
                const newBalance = Number(participantWallet.balance) + Number(participant.amount);

                await WalletService.updateWallet(participantWallet.id, {
                    balance: newBalance
                });

                // Create refund transaction
                await WalletService.createTransaction({
                    walletId: participantWallet.id,
                    userId: participant.participantId,
                    type: 'STAKE_REFUND',
                    amount: Number(participant.amount),
                    description: 'Refund for failed stake',
                    referenceId: stake.id
                });

                participantRefunds.push({
                    userId: participant.participantId,
                    amount: Number(participant.amount),
                    rewardType: 'REFUND',
                    description: 'Refund for failed stake'
                });
            }

            return {
                success: true,
                totalReward: 0,
                rewards: participantRefunds
            };

        } catch (error) {
            console.error('Error processing stake failure:', error);
            return {
                success: false,
                totalReward: 0,
                rewards: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Distribute rewards to users
     */
    private static async distributeRewards(stake: any, rewardCalculation: any): Promise<Array<{
        userId: string;
        amount: number;
        rewardType: string;
        description: string;
    }>> {
        const rewards = [];

        // Main user reward
        const mainReward = {
            userId: stake.userId,
            amount: rewardCalculation.totalReward,
            rewardType: 'COMPLETION',
            description: rewardCalculation.description
        };

        // Add to user's wallet
        await WalletService.processStakeCompletion(
            stake.userId,
            Number(stake.userStake),
            rewardCalculation.totalReward,
            stake.id
        );

        // Create reward record
        await prisma.reward.create({
            data: {
                stakeId: stake.id,
                userId: stake.userId,
                amount: rewardCalculation.totalReward,
                rewardType: 'COMPLETION',
                description: rewardCalculation.description,
                awardedAt: new Date()
            }
        });

        rewards.push(mainReward);

        // Distribute supporter rewards for social stakes
        if (stake.stakeType === 'SOCIAL_STAKE' && stake.participants.length > 0) {
            const supporterReward = rewardCalculation.totalReward * 0.1; // 10% to supporters

            for (const participant of stake.participants) {
                if (participant.isSupporter) {
                    await WalletService.processStakeCompletion(
                        participant.participantId,
                        0, // No stake amount for supporters
                        supporterReward,
                        stake.id
                    );

                    await prisma.reward.create({
                        data: {
                            stakeId: stake.id,
                            userId: participant.participantId,
                            amount: supporterReward,
                            rewardType: 'SUPPORT',
                            description: 'Reward for supporting successful stake',
                            awardedAt: new Date()
                        }
                    });

                    rewards.push({
                        userId: participant.participantId,
                        amount: supporterReward,
                        rewardType: 'SUPPORT',
                        description: 'Reward for supporting successful stake'
                    });
                }
            }
        }

        return rewards;
    }

    /**
     * Get user streak data
     */
    private static async getUserStreakData(userId: string): Promise<UserStreakData> {
        const wallet = await WalletService.getOrCreateWallet(userId);

        // Get recent completed stakes to calculate streak
        const recentStakes = await prisma.stake.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                completedAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            },
            orderBy: { completedAt: 'desc' }
        });

        // Calculate current streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < recentStakes.length; i++) {
            if (i === 0 || this.isConsecutiveDay(recentStakes[i - 1].completedAt!, recentStakes[i].completedAt!)) {
                tempStreak++;
                currentStreak = Math.max(currentStreak, tempStreak);
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Calculate completion rate
        const totalStakes = await prisma.stake.count({
            where: { userId }
        });
        const completedStakes = await prisma.stake.count({
            where: { userId, status: 'COMPLETED' }
        });
        const completionRate = totalStakes > 0 ? (completedStakes / totalStakes) * 100 : 0;

        return {
            currentStreak,
            longestStreak,
            completionRate
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

    /**
     * Check if two dates are consecutive days
     */
    private static isConsecutiveDay(date1: Date, date2: Date): boolean {
        const day1 = new Date(date1);
        const day2 = new Date(date2);
        const diffTime = Math.abs(day2.getTime() - day1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }
}
