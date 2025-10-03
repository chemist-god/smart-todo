import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";

export interface AppealSubmission {
    stakeId: string;
    userId: string;
    reason: string;
    evidence?: string;
}

export interface AppealReview {
    appealId: string;
    adminId: string;
    decision: 'APPROVED' | 'REJECTED';
    adminNotes?: string;
}

export interface AppealResult {
    success: boolean;
    appealId?: string;
    refundAmount?: number;
    error?: string;
}

export class AppealService {
    /**
     * Submit an appeal for a failed stake
     */
    static async submitAppeal(appealData: AppealSubmission): Promise<AppealResult> {
        try {
            // Check if stake exists and belongs to user
            const stake = await prisma.stake.findFirst({
                where: {
                    id: appealData.stakeId,
                    userId: appealData.userId,
                    status: 'FAILED'
                }
            });

            if (!stake) {
                throw new Error("Stake not found or not eligible for appeal");
            }

            // Check if appeal already exists
            const existingAppeal = await (prisma as any).stakeAppeal.findFirst({
                where: {
                    stakeId: appealData.stakeId,
                    userId: appealData.userId,
                    status: {
                        in: ['PENDING', 'UNDER_REVIEW']
                    }
                }
            });

            if (existingAppeal) {
                throw new Error("An appeal for this stake is already pending");
            }

            // Create appeal
            const appeal = await (prisma as any).stakeAppeal.create({
                data: {
                    stakeId: appealData.stakeId,
                    userId: appealData.userId,
                    reason: appealData.reason,
                    evidence: appealData.evidence,
                    status: 'PENDING'
                }
            });

            // Update stake status to disputed
            await prisma.stake.update({
                where: { id: appealData.stakeId },
                data: { status: 'DISPUTED' }
            });

            return {
                success: true,
                appealId: appeal.id
            };

        } catch (error) {
            console.error('Error submitting appeal:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Review an appeal (admin function)
     */
    static async reviewAppeal(reviewData: AppealReview): Promise<AppealResult> {
        try {
            const appeal = await (prisma as any).stakeAppeal.findUnique({
                where: { id: reviewData.appealId },
                include: {
                    stake: true
                }
            });

            if (!appeal) {
                throw new Error("Appeal not found");
            }

            if (appeal.status !== 'PENDING' && appeal.status !== 'UNDER_REVIEW') {
                throw new Error("Appeal has already been reviewed");
            }

            // Update appeal status
            await (prisma as any).stakeAppeal.update({
                where: { id: reviewData.appealId },
                data: {
                    status: reviewData.decision,
                    adminNotes: reviewData.adminNotes,
                    reviewedAt: new Date(),
                    reviewedBy: reviewData.adminId
                }
            });

            if (reviewData.decision === 'APPROVED') {
                // Refund the penalty amount
                const refundAmount = Number(appeal.stake.penaltyAmount);

                // Get user's wallet
                const userWallet = await WalletService.getOrCreateWallet(appeal.userId);
                const newBalance = Number(userWallet.balance) + refundAmount;

                await WalletService.updateWallet(userWallet.id, {
                    balance: newBalance
                });

                // Create refund transaction
                await WalletService.createTransaction({
                    walletId: userWallet.id,
                    userId: appeal.userId,
                    type: 'APPEAL_REFUND',
                    amount: refundAmount,
                    description: 'Refund from approved appeal',
                    referenceId: appeal.stakeId
                });

                // Update stake status back to completed
                await prisma.stake.update({
                    where: { id: appeal.stakeId },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date()
                    }
                });

                // Remove penalty record
                await prisma.penalty.deleteMany({
                    where: {
                        stakeId: appeal.stakeId,
                        userId: appeal.userId
                    }
                });

                return {
                    success: true,
                    refundAmount
                };
            } else {
                // Appeal rejected, keep stake as failed
                await prisma.stake.update({
                    where: { id: appeal.stakeId },
                    data: { status: 'FAILED' }
                });

                return {
                    success: true
                };
            }

        } catch (error) {
            console.error('Error reviewing appeal:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get user's appeals
     */
    static async getUserAppeals(userId: string, status?: string): Promise<Array<{
        id: string;
        stakeId: string;
        stakeTitle: string;
        reason: string;
        evidence?: string;
        status: string;
        adminNotes?: string;
        createdAt: Date;
        reviewedAt?: Date;
    }>> {
        const appeals = await (prisma as any).stakeAppeal.findMany({
            where: {
                userId,
                ...(status && { status: status as any })
            },
            include: {
                stake: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return appeals.map(appeal => ({
            id: appeal.id,
            stakeId: appeal.stakeId,
            stakeTitle: appeal.stake.title,
            reason: appeal.reason,
            evidence: appeal.evidence || undefined,
            status: appeal.status,
            adminNotes: appeal.adminNotes || undefined,
            createdAt: appeal.createdAt,
            reviewedAt: appeal.reviewedAt || undefined
        }));
    }

    /**
     * Get all pending appeals (admin function)
     */
    static async getPendingAppeals(): Promise<Array<{
        id: string;
        stakeId: string;
        userId: string;
        userName: string;
        stakeTitle: string;
        reason: string;
        evidence?: string;
        createdAt: Date;
    }>> {
        const appeals = await (prisma as any).stakeAppeal.findMany({
            where: {
                status: {
                    in: ['PENDING', 'UNDER_REVIEW']
                }
            },
            include: {
                stake: {
                    select: {
                        title: true
                    }
                },
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return appeals.map(appeal => ({
            id: appeal.id,
            stakeId: appeal.stakeId,
            userId: appeal.userId,
            userName: appeal.user.name || 'Unknown',
            stakeTitle: appeal.stake.title,
            reason: appeal.reason,
            evidence: appeal.evidence || undefined,
            createdAt: appeal.createdAt
        }));
    }

    /**
     * Get appeal statistics
     */
    static async getAppealStats(): Promise<{
        totalAppeals: number;
        pendingAppeals: number;
        approvedAppeals: number;
        rejectedAppeals: number;
        approvalRate: number;
    }> {
        const [total, pending, approved, rejected] = await Promise.all([
            (prisma as any).stakeAppeal.count(),
            (prisma as any).stakeAppeal.count({ where: { status: 'PENDING' } }),
            (prisma as any).stakeAppeal.count({ where: { status: 'APPROVED' } }),
            (prisma as any).stakeAppeal.count({ where: { status: 'REJECTED' } })
        ]);

        const approvalRate = total > 0 ? (approved / total) * 100 : 0;

        return {
            totalAppeals: total,
            pendingAppeals: pending,
            approvedAppeals: approved,
            rejectedAppeals: rejected,
            approvalRate
        };
    }
}
