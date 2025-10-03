import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";

export interface ExtensionRequest {
    stakeId: string;
    userId: string;
    newDeadline: Date;
    reason?: string;
}

export interface ExtensionResult {
    success: boolean;
    extensionId?: string;
    extensionFee?: number;
    newDeadline?: Date;
    error?: string;
}

export interface ExtensionConfig {
    maxExtensions: number;
    baseExtensionFee: number;
    feeMultiplier: number; // Fee increases with each extension
    maxExtensionDays: number;
}

export class ExtensionService {
    private static readonly CONFIG: ExtensionConfig = {
        maxExtensions: 3,
        baseExtensionFee: 10, // $10 base fee
        feeMultiplier: 1.5, // 50% increase per extension
        maxExtensionDays: 7 // Maximum 7 days extension
    };

    /**
     * Request a deadline extension for a stake
     */
    static async requestExtension(extensionData: ExtensionRequest): Promise<ExtensionResult> {
        try {
            // Check if stake exists and belongs to user
            const stake = await prisma.stake.findFirst({
                where: {
                    id: extensionData.stakeId,
                    userId: extensionData.userId,
                    status: {
                        in: ['ACTIVE', 'GRACE_PERIOD']
                    }
                }
            });

            if (!stake) {
                throw new Error("Stake not found or not eligible for extension");
            }

            // Check extension limits
            if (stake.extensionCount >= this.CONFIG.maxExtensions) {
                throw new Error(`Maximum number of extensions (${this.CONFIG.maxExtensions}) reached`);
            }

            // Validate new deadline
            const now = new Date();
            const maxExtensionDate = new Date(now.getTime() + (this.CONFIG.maxExtensionDays * 24 * 60 * 60 * 1000));

            if (extensionData.newDeadline <= now) {
                throw new Error("New deadline must be in the future");
            }

            if (extensionData.newDeadline > maxExtensionDate) {
                throw new Error(`Extension cannot exceed ${this.CONFIG.maxExtensionDays} days from now`);
            }

            if (extensionData.newDeadline <= stake.deadline) {
                throw new Error("New deadline must be after current deadline");
            }

            // Calculate extension fee
            const extensionFee = this.calculateExtensionFee(stake.extensionCount);

            // Check if user has sufficient balance
            const userWallet = await WalletService.getOrCreateWallet(extensionData.userId);
            if (Number(userWallet.balance) < extensionFee) {
                throw new Error("Insufficient balance for extension fee");
            }

            // Deduct extension fee
            const newBalance = Number(userWallet.balance) - extensionFee;
            await WalletService.updateWallet(userWallet.id, {
                balance: newBalance
            });

            // Create extension transaction
            await WalletService.createTransaction({
                walletId: userWallet.id,
                userId: extensionData.userId,
                type: 'STAKE_EXTENSION',
                amount: -extensionFee,
                description: `Extension fee for stake: ${stake.title}`,
                referenceId: extensionData.stakeId
            });

            // Create extension record
            const extension = await (prisma as any).stakeExtension.create({
                data: {
                    stakeId: extensionData.stakeId,
                    userId: extensionData.userId,
                    oldDeadline: stake.deadline,
                    newDeadline: extensionData.newDeadline,
                    extensionFee: extensionFee,
                    reason: extensionData.reason
                }
            });

            // Update stake
            await prisma.stake.update({
                where: { id: extensionData.stakeId },
                data: {
                    deadline: extensionData.newDeadline,
                    isExtended: true,
                    extensionCount: stake.extensionCount + 1,
                    extensionFee: Number(stake.extensionFee) + extensionFee,
                    status: 'ACTIVE', // Reset from grace period if applicable
                    gracePeriodEnd: null // Clear grace period
                }
            });

            return {
                success: true,
                extensionId: extension.id,
                extensionFee,
                newDeadline: extensionData.newDeadline
            };

        } catch (error) {
            console.error('Error requesting extension:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Calculate extension fee based on number of previous extensions
     */
    private static calculateExtensionFee(extensionCount: number): number {
        return this.CONFIG.baseExtensionFee * Math.pow(this.CONFIG.feeMultiplier, extensionCount);
    }

    /**
     * Get extension history for a stake
     */
    static async getStakeExtensions(stakeId: string): Promise<Array<{
        id: string;
        oldDeadline: Date;
        newDeadline: Date;
        extensionFee: number;
        reason?: string;
        createdAt: Date;
    }>> {
        const extensions = await (prisma as any).stakeExtension.findMany({
            where: { stakeId },
            orderBy: { createdAt: 'asc' }
        });

        return extensions.map(ext => ({
            id: ext.id,
            oldDeadline: ext.oldDeadline,
            newDeadline: ext.newDeadline,
            extensionFee: Number(ext.extensionFee),
            reason: ext.reason || undefined,
            createdAt: ext.createdAt
        }));
    }

    /**
     * Get user's extension history
     */
    static async getUserExtensions(userId: string): Promise<Array<{
        id: string;
        stakeId: string;
        stakeTitle: string;
        oldDeadline: Date;
        newDeadline: Date;
        extensionFee: number;
        reason?: string;
        createdAt: Date;
    }>> {
        const extensions = await (prisma as any).stakeExtension.findMany({
            where: { userId },
            include: {
                stake: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return extensions.map(ext => ({
            id: ext.id,
            stakeId: ext.stakeId,
            stakeTitle: ext.stake.title,
            oldDeadline: ext.oldDeadline,
            newDeadline: ext.newDeadline,
            extensionFee: Number(ext.extensionFee),
            reason: ext.reason || undefined,
            createdAt: ext.createdAt
        }));
    }

    /**
     * Get extension statistics
     */
    static async getExtensionStats(): Promise<{
        totalExtensions: number;
        totalExtensionFees: number;
        averageExtensionsPerStake: number;
        mostCommonExtensionReasons: Array<{
            reason: string;
            count: number;
        }>;
    }> {
        const [totalExtensions, extensions, stakes] = await Promise.all([
            prisma.stakeExtension.count(),
            prisma.stakeExtension.findMany({
                select: {
                    extensionFee: true,
                    reason: true
                }
            }),
            prisma.stake.count({
                where: {
                    extensionCount: {
                        gt: 0
                    }
                }
            })
        ]);

        const totalExtensionFees = extensions.reduce((sum, ext) => sum + Number(ext.extensionFee), 0);
        const averageExtensionsPerStake = stakes > 0 ? totalExtensions / stakes : 0;

        // Count extension reasons
        const reasonCounts = extensions.reduce((acc, ext) => {
            const reason = ext.reason || 'No reason provided';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostCommonExtensionReasons = Object.entries(reasonCounts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalExtensions,
            totalExtensionFees,
            averageExtensionsPerStake,
            mostCommonExtensionReasons
        };
    }

    /**
     * Check if a stake is eligible for extension
     */
    static async isEligibleForExtension(stakeId: string, userId: string): Promise<{
        eligible: boolean;
        reason?: string;
        nextExtensionFee?: number;
    }> {
        try {
            const stake = await prisma.stake.findFirst({
                where: {
                    id: stakeId,
                    userId,
                    status: {
                        in: ['ACTIVE', 'GRACE_PERIOD']
                    }
                }
            });

            if (!stake) {
                return {
                    eligible: false,
                    reason: "Stake not found or not active"
                };
            }

            if (stake.extensionCount >= this.CONFIG.maxExtensions) {
                return {
                    eligible: false,
                    reason: `Maximum extensions (${this.CONFIG.maxExtensions}) reached`
                };
            }

            const nextExtensionFee = this.calculateExtensionFee(stake.extensionCount);
            const userWallet = await WalletService.getOrCreateWallet(userId);

            if (Number(userWallet.balance) < nextExtensionFee) {
                return {
                    eligible: false,
                    reason: "Insufficient balance for extension fee",
                    nextExtensionFee
                };
            }

            return {
                eligible: true,
                nextExtensionFee
            };

        } catch (error) {
            return {
                eligible: false,
                reason: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
