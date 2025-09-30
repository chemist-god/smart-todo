import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export interface WalletUpdate {
    balance?: number;
    totalEarned?: number;
    totalLost?: number;
    totalStaked?: number;
    completionRate?: number;
    currentStreak?: number;
    longestStreak?: number;
    rank?: number;
}

export interface TransactionData {
    walletId: string;
    userId: string;
    type: string;
    amount: number;
    description: string;
    referenceId?: string;
}

export class WalletService {
    /**
     * Get or create user wallet
     */
    static async getOrCreateWallet(userId: string) {
        let wallet = await prisma.userWallet.findUnique({
            where: { userId }
        });

        if (!wallet) {
            wallet = await prisma.userWallet.create({
                data: {
                    userId,
                    balance: new Decimal(0),
                    totalEarned: new Decimal(0),
                    totalLost: new Decimal(0),
                    totalStaked: new Decimal(0),
                    completionRate: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    rank: 0,
                }
            });
        }

        return wallet;
    }

    /**
     * Update wallet with new values
     */
    static async updateWallet(walletId: string, updates: WalletUpdate) {
        // Convert numbers to proper Decimal values for Prisma
        const processedUpdates: any = {
            updatedAt: new Date()
        };

        if (updates.balance !== undefined) {
            processedUpdates.balance = new Decimal(updates.balance);
        }
        if (updates.totalEarned !== undefined) {
            processedUpdates.totalEarned = new Decimal(updates.totalEarned);
        }
        if (updates.totalLost !== undefined) {
            processedUpdates.totalLost = new Decimal(updates.totalLost);
        }
        if (updates.totalStaked !== undefined) {
            processedUpdates.totalStaked = new Decimal(updates.totalStaked);
        }
        if (updates.completionRate !== undefined) {
            processedUpdates.completionRate = updates.completionRate;
        }
        if (updates.currentStreak !== undefined) {
            processedUpdates.currentStreak = updates.currentStreak;
        }
        if (updates.longestStreak !== undefined) {
            processedUpdates.longestStreak = updates.longestStreak;
        }
        if (updates.rank !== undefined) {
            processedUpdates.rank = updates.rank;
        }

        return await prisma.userWallet.update({
            where: { id: walletId },
            data: processedUpdates
        });
    }

    /**
     * Create a wallet transaction
     */
    static async createTransaction(data: TransactionData) {
        return await prisma.walletTransaction.create({
            data: {
                walletId: data.walletId,
                userId: data.userId,
                type: data.type,
                amount: new Decimal(data.amount),
                description: data.description,
                referenceId: data.referenceId
            }
        });
    }

    /**
     * Process a stake creation (deduct from balance)
     */
    static async processStakeCreation(userId: string, amount: number, stakeId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        // Check if user has sufficient balance
        if (Number(wallet.balance) < amount) {
            throw new Error("Insufficient balance");
        }

        // Update wallet
        const newBalance = Number(wallet.balance) - amount;
        const newTotalStaked = Number(wallet.totalStaked) + amount;

        const updatedWallet = await this.updateWallet(wallet.id, {
            balance: newBalance,
            totalStaked: newTotalStaked
        });

        // Create transaction
        await this.createTransaction({
            walletId: wallet.id,
            userId,
            type: 'STAKE_CREATED',
            amount: amount,
            description: `Stake created for ${amount} GHS`,
            referenceId: stakeId
        });

        return updatedWallet;
    }

    /**
     * Process a successful stake completion (add rewards)
     */
    static async processStakeCompletion(userId: string, stakeAmount: number, rewardAmount: number, stakeId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        const newBalance = Number(wallet.balance) + rewardAmount;
        const newTotalEarned = Number(wallet.totalEarned) + rewardAmount;

        const updatedWallet = await this.updateWallet(wallet.id, {
            balance: newBalance,
            totalEarned: newTotalEarned
        });

        // Create transaction
        await this.createTransaction({
            walletId: wallet.id,
            userId,
            type: 'STAKE_REWARD',
            amount: rewardAmount,
            description: `Stake completed - earned ${rewardAmount} GHS`,
            referenceId: stakeId
        });

        return updatedWallet;
    }

    /**
     * Process a failed stake (penalty applied)
     */
    static async processStakeFailure(userId: string, penaltyAmount: number, stakeId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        const newTotalLost = Number(wallet.totalLost) + penaltyAmount;

        const updatedWallet = await this.updateWallet(wallet.id, {
            totalLost: newTotalLost
        });

        // Create transaction
        await this.createTransaction({
            walletId: wallet.id,
            userId,
            type: 'STAKE_PENALTY',
            amount: penaltyAmount,
            description: `Stake failed - penalty ${penaltyAmount} GHS`,
            referenceId: stakeId
        });

        return updatedWallet;
    }

    /**
     * Calculate and update user completion rate
     */
    static async updateCompletionRate(userId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        // Get user's stakes
        const stakes = await prisma.stake.findMany({
            where: { userId },
            select: { status: true }
        });

        if (stakes.length === 0) {
            return wallet;
        }

        const completedStakes = stakes.filter(s => s.status === 'COMPLETED').length;
        const completionRate = (completedStakes / stakes.length) * 100;

        return await this.updateWallet(wallet.id, {
            completionRate: Number(completionRate.toFixed(2))
        });
    }

    /**
     * Calculate and update user streak
     */
    static async updateStreak(userId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        // Get completed stakes ordered by completion date
        const completedStakes = await prisma.stake.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                completedAt: { not: null }
            },
            orderBy: { completedAt: 'desc' },
            select: { completedAt: true }
        });

        let currentStreak = 0;
        let longestStreak = wallet.longestStreak;

        if (completedStakes.length > 0) {
            // Calculate current streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < completedStakes.length; i++) {
                const stakeDate = new Date(completedStakes[i].completedAt!);
                stakeDate.setHours(0, 0, 0, 0);

                const daysDiff = Math.floor((today.getTime() - stakeDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysDiff === currentStreak) {
                    currentStreak++;
                } else {
                    break;
                }
            }

            // Calculate longest streak
            let tempStreak = 1;
            for (let i = 1; i < completedStakes.length; i++) {
                const currentDate = new Date(completedStakes[i].completedAt!);
                const previousDate = new Date(completedStakes[i - 1].completedAt!);

                const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysDiff === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        return await this.updateWallet(wallet.id, {
            currentStreak,
            longestStreak
        });
    }

    /**
     * Update user rank based on completion rate and total earned
     */
    static async updateRank(userId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        // Get all wallets ordered by completion rate and total earned
        const allWallets = await prisma.userWallet.findMany({
            orderBy: [
                { completionRate: 'desc' },
                { totalEarned: 'desc' }
            ],
            select: { id: true, userId: true }
        });

        const userRank = allWallets.findIndex(w => w.userId === userId) + 1;

        return await this.updateWallet(wallet.id, {
            rank: userRank
        });
    }

    /**
     * Get wallet statistics
     */
    static async getWalletStats(userId: string) {
        const wallet = await this.getOrCreateWallet(userId);

        // Get recent transactions
        const recentTransactions = await prisma.walletTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Calculate monthly earnings
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyEarnings = await prisma.walletTransaction.aggregate({
            where: {
                walletId: wallet.id,
                type: 'STAKE_REWARD',
                createdAt: { gte: startOfMonth }
            },
            _sum: { amount: true }
        });

        return {
            wallet: {
                balance: Number(wallet.balance),
                totalEarned: Number(wallet.totalEarned),
                totalLost: Number(wallet.totalLost),
                totalStaked: Number(wallet.totalStaked),
                completionRate: Number(wallet.completionRate),
                currentStreak: wallet.currentStreak,
                longestStreak: wallet.longestStreak,
                rank: wallet.rank,
            },
            recentTransactions: recentTransactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: Number(t.amount),
                description: t.description,
                createdAt: t.createdAt,
                referenceId: t.referenceId
            })),
            monthlyEarnings: Number(monthlyEarnings._sum.amount || 0)
        };
    }
}
