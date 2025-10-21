import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";
import { RewardService } from "@/lib/reward-service";

export interface RecoveryStakeRequest {
    originalStakeId: string;
    userId: string;
    title: string;
    description?: string;
    stakeType: 'SELF_STAKE' | 'SOCIAL_STAKE' | 'CHALLENGE_STAKE' | 'TEAM_STAKE' | 'CHARITY_STAKE';
    userStake: number;
    deadline: Date;
}

export interface RecoveryStakeResult {
    success: boolean;
    recoveryStakeId?: string;
    recoveryTarget?: number;
    error?: string;
}

export interface RecoveryStakeConfig {
    maxRecoveryPercentage: number; // Maximum % of lost amount that can be recovered
    minRecoveryStake: number; // Minimum stake amount for recovery
    maxRecoveryStakes: number; // Maximum number of recovery stakes per original stake
    recoveryMultiplier: number; // Multiplier for recovery rewards
}

export class RecoveryStakeService {
    private static readonly CONFIG: RecoveryStakeConfig = {
        maxRecoveryPercentage: 80, // Can recover up to 80% of lost amount
        minRecoveryStake: 5, // Minimum $5 stake
        maxRecoveryStakes: 3, // Maximum 3 recovery attempts
        recoveryMultiplier: 1.5 // 50% bonus on recovery rewards
    };

    /**
     * Create a recovery stake
     */
    static async createRecoveryStake(recoveryData: RecoveryStakeRequest): Promise<RecoveryStakeResult> {
        try {
            // Check if original stake exists and belongs to user
            const originalStake = await prisma.stake.findFirst({
                where: {
                    id: recoveryData.originalStakeId,
                    userId: recoveryData.userId,
                    status: 'FAILED'
                }
            });

            if (!originalStake) {
                throw new Error("Original stake not found or not eligible for recovery");
            }

            // Check recovery stake limits
            const existingRecoveryStakes = await (prisma as any).recoveryStake.count({
                where: {
                    originalStakeId: recoveryData.originalStakeId,
                    userId: recoveryData.userId
                }
            });

            if (existingRecoveryStakes >= this.CONFIG.maxRecoveryStakes) {
                throw new Error(`Maximum recovery stakes (${this.CONFIG.maxRecoveryStakes}) reached for this stake`);
            }

            // Calculate recovery target
            const lostAmount = Number(originalStake.penaltyAmount);
            const maxRecoveryAmount = lostAmount * (this.CONFIG.maxRecoveryPercentage / 100);
            const recoveryTarget = Math.min(maxRecoveryAmount, recoveryData.userStake * this.CONFIG.recoveryMultiplier);

            // Validate minimum stake amount
            if (recoveryData.userStake < this.CONFIG.minRecoveryStake) {
                throw new Error(`Minimum recovery stake is $${this.CONFIG.minRecoveryStake}`);
            }

            // Check if user has sufficient balance
            const userWallet = await WalletService.getOrCreateWallet(recoveryData.userId);
            if (Number(userWallet.balance) < recoveryData.userStake) {
                throw new Error("Insufficient balance for recovery stake");
            }

            // Deduct stake amount from wallet
            const newBalance = Number(userWallet.balance) - recoveryData.userStake;
            await WalletService.updateWallet(userWallet.id, {
                balance: newBalance
            });

            // Create recovery stake
            const recoveryStake = await (prisma as any).recoveryStake.create({
                data: {
                    originalStakeId: recoveryData.originalStakeId,
                    userId: recoveryData.userId,
                    title: recoveryData.title,
                    description: recoveryData.description,
                    stakeType: recoveryData.stakeType,
                    totalAmount: recoveryData.userStake,
                    userStake: recoveryData.userStake,
                    deadline: recoveryData.deadline,
                    recoveryTarget: recoveryTarget,
                    status: 'ACTIVE'
                }
            });

            // Create stake transaction
            await WalletService.createTransaction({
                walletId: userWallet.id,
                userId: recoveryData.userId,
                type: 'STAKE_CREATION',
                amount: -recoveryData.userStake,
                description: `Recovery stake: ${recoveryData.title}`,
                referenceId: recoveryStake.id
            });

            return {
                success: true,
                recoveryStakeId: recoveryStake.id,
                recoveryTarget
            };

        } catch (error) {
            console.error('Error creating recovery stake:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process completion of a recovery stake
     */
    static async processRecoveryCompletion(recoveryStakeId: string): Promise<{
        success: boolean;
        recoveryAmount?: number;
        bonusAmount?: number;
        error?: string;
    }> {
        try {
            const recoveryStake = await (prisma as any).recoveryStake.findUnique({
                where: { id: recoveryStakeId },
                include: {
                    originalStake: true
                }
            });

            if (!recoveryStake) {
                throw new Error("Recovery stake not found");
            }

            if (recoveryStake.status !== 'ACTIVE') {
                throw new Error("Recovery stake is not active");
            }

            // Calculate recovery amount (up to the recovery target)
            const recoveryAmount = Math.min(
                Number(recoveryStake.recoveryTarget),
                Number(recoveryStake.userStake) * this.CONFIG.recoveryMultiplier
            );

            // Calculate bonus amount
            const bonusAmount = recoveryAmount - Number(recoveryStake.userStake);

            // Get user's wallet
            const userWallet = await WalletService.getOrCreateWallet(recoveryStake.userId);
            const newBalance = Number(userWallet.balance) + recoveryAmount;

            await WalletService.updateWallet(userWallet.id, {
                balance: newBalance
            });

            // Create recovery transaction
            await WalletService.createTransaction({
                walletId: userWallet.id,
                userId: recoveryStake.userId,
                type: 'RECOVERY_REWARD',
                amount: recoveryAmount,
                description: `Recovery reward for: ${recoveryStake.title}`,
                referenceId: recoveryStake.id
            });

            // Update recovery stake status
            await (prisma as any).recoveryStake.update({
                where: { id: recoveryStakeId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date()
                }
            });

            // Update original stake with recovery amount
            await prisma.stake.update({
                where: { id: recoveryStake.originalStakeId },
                data: {
                    penaltyAmount: Math.max(0, Number(recoveryStake.originalStake.penaltyAmount) - recoveryAmount)
                }
            });

            return {
                success: true,
                recoveryAmount,
                bonusAmount
            };

        } catch (error) {
            console.error('Error processing recovery completion:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process failure of a recovery stake
     */
    static async processRecoveryFailure(recoveryStakeId: string): Promise<{
        success: boolean;
        penaltyAmount?: number;
        error?: string;
    }> {
        try {
            const recoveryStake = await (prisma as any).recoveryStake.findUnique({
                where: { id: recoveryStakeId }
            });

            if (!recoveryStake) {
                throw new Error("Recovery stake not found");
            }

            if (recoveryStake.status !== 'ACTIVE') {
                throw new Error("Recovery stake is not active");
            }

            const penaltyAmount = Number(recoveryStake.userStake);

            // Update recovery stake status
            await (prisma as any).recoveryStake.update({
                where: { id: recoveryStakeId },
                data: {
                    status: 'FAILED'
                }
            });

            // Create penalty record
            await prisma.penalty.create({
                data: {
                    stakeId: recoveryStake.originalStakeId,
                    userId: recoveryStake.userId,
                    amount: penaltyAmount,
                    reason: 'Recovery stake failed',
                    appliedAt: new Date()
                }
            });

            return {
                success: true,
                penaltyAmount
            };

        } catch (error) {
            console.error('Error processing recovery failure:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get user's recovery stakes
     */
    static async getUserRecoveryStakes(userId: string): Promise<Array<{
        id: string;
        originalStakeId: string;
        originalStakeTitle: string;
        title: string;
        description?: string;
        stakeType: string;
        totalAmount: number;
        userStake: number;
        recoveryTarget: number;
        deadline: Date;
        status: string;
        createdAt: Date;
        completedAt?: Date;
    }>> {
        const recoveryStakes = await (prisma as any).recoveryStake.findMany({
            where: { userId },
            include: {
                originalStake: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return recoveryStakes.map((stake: any) => ({
            id: stake.id,
            originalStakeId: stake.originalStakeId,
            originalStakeTitle: stake.originalStake.title,
            title: stake.title,
            description: stake.description || undefined,
            stakeType: stake.stakeType,
            totalAmount: Number(stake.totalAmount),
            userStake: Number(stake.userStake),
            recoveryTarget: Number(stake.recoveryTarget),
            deadline: stake.deadline,
            status: stake.status,
            createdAt: stake.createdAt,
            completedAt: stake.completedAt || undefined
        }));
    }

    /**
     * Get recovery statistics
     */
    static async getRecoveryStats(): Promise<{
        totalRecoveryStakes: number;
        completedRecoveryStakes: number;
        totalRecoveredAmount: number;
        averageRecoveryAmount: number;
        successRate: number;
    }> {
        const [total, completed, allRecoveryStakes] = await Promise.all([
            (prisma as any).recoveryStake.count(),
            (prisma as any).recoveryStake.count({ where: { status: 'COMPLETED' } }),
            (prisma as any).recoveryStake.findMany({
                where: { status: 'COMPLETED' },
                select: {
                    userStake: true,
                    recoveryTarget: true
                }
            })
        ]);

        const totalRecoveredAmount = allRecoveryStakes.reduce((sum: number, stake: any) =>
            sum + Number(stake.recoveryTarget), 0
        );

        const averageRecoveryAmount = completed > 0 ? totalRecoveredAmount / completed : 0;
        const successRate = total > 0 ? (completed / total) * 100 : 0;

        return {
            totalRecoveryStakes: total,
            completedRecoveryStakes: completed,
            totalRecoveredAmount,
            averageRecoveryAmount,
            successRate
        };
    }

    /**
     * Check if a stake is eligible for recovery
     */
    static async isEligibleForRecovery(originalStakeId: string, userId: string): Promise<{
        eligible: boolean;
        reason?: string;
        maxRecoveryAmount?: number;
        existingRecoveryStakes?: number;
    }> {
        try {
            const originalStake = await prisma.stake.findFirst({
                where: {
                    id: originalStakeId,
                    userId,
                    status: 'FAILED'
                }
            });

            if (!originalStake) {
                return {
                    eligible: false,
                    reason: "Original stake not found or not failed"
                };
            }

            const existingRecoveryStakes = await (prisma as any).recoveryStake.count({
                where: {
                    originalStakeId,
                    userId
                }
            });

            if (existingRecoveryStakes >= this.CONFIG.maxRecoveryStakes) {
                return {
                    eligible: false,
                    reason: `Maximum recovery stakes (${this.CONFIG.maxRecoveryStakes}) reached`,
                    existingRecoveryStakes
                };
            }

            const lostAmount = Number(originalStake.penaltyAmount);
            const maxRecoveryAmount = lostAmount * (this.CONFIG.maxRecoveryPercentage / 100);

            return {
                eligible: true,
                maxRecoveryAmount,
                existingRecoveryStakes
            };

        } catch (error) {
            return {
                eligible: false,
                reason: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
