import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export interface EscrowTransaction {
    id: string;
    stakeId: string;
    userId: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'FAILED';
    paymentMethod: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO';
    paymentIntentId?: string;
    escrowAccountId?: string;
    lockedAt?: Date;
    releasedAt?: Date;
    refundedAt?: Date;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
    client_secret: string;
    payment_method?: string;
}

export interface EscrowConfig {
    minStakeAmount: number;
    maxStakeAmount: number;
    supportedCurrencies: string[];
    escrowFeePercentage: number;
    platformFeePercentage: number;
    autoReleaseHours: number;
    refundPolicyDays: number;
}

export class EscrowService {
    private static readonly CONFIG: EscrowConfig = {
        minStakeAmount: 5, // $5 minimum
        maxStakeAmount: 10000, // $10,000 maximum
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
        escrowFeePercentage: 2.9, // 2.9% + $0.30 per transaction
        platformFeePercentage: 1.0, // 1% platform fee
        autoReleaseHours: 24, // Auto-release after 24 hours of completion
        refundPolicyDays: 7 // 7-day refund policy
    };

    /**
     * Create escrow transaction for stake
     */
    static async createEscrowTransaction(
        stakeId: string,
        userId: string,
        amount: number,
        currency: string = 'USD',
        paymentMethod: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO' = 'STRIPE'
    ): Promise<{
        success: boolean;
        escrowTransactionId?: string;
        paymentIntent?: PaymentIntent;
        error?: string;
    }> {
        try {
            // Validate amount
            if (amount < this.CONFIG.minStakeAmount || amount > this.CONFIG.maxStakeAmount) {
                throw new Error(`Amount must be between $${this.CONFIG.minStakeAmount} and $${this.CONFIG.maxStakeAmount}`);
            }

            // Check if escrow already exists for this stake
            const existingEscrow = await prisma.escrowTransaction.findFirst({
                where: { stakeId, userId }
            });

            if (existingEscrow) {
                throw new Error('Escrow transaction already exists for this stake');
            }

            // Calculate fees
            const escrowFee = this.calculateEscrowFee(amount);
            const platformFee = this.calculatePlatformFee(amount);
            const totalAmount = amount + escrowFee + platformFee;

            // Create escrow transaction record
            const escrowTransaction = await prisma.escrowTransaction.create({
                data: {
                    stakeId,
                    userId,
                    amount: Number(amount),
                    currency,
                    status: 'PENDING',
                    paymentMethod,
                    escrowFee: Number(escrowFee),
                    platformFee: Number(platformFee),
                    totalAmount: Number(totalAmount)
                }
            });

            // Create payment intent based on payment method
            let paymentIntent: PaymentIntent | undefined;

            switch (paymentMethod) {
                case 'STRIPE':
                    paymentIntent = await this.createStripePaymentIntent(totalAmount, currency);
                    break;
                case 'PAYPAL':
                    paymentIntent = await this.createPayPalOrder(totalAmount, currency);
                    break;
                case 'BANK_TRANSFER':
                    paymentIntent = await this.createBankTransfer(totalAmount, currency);
                    break;
                case 'CRYPTO':
                    paymentIntent = await this.createCryptoPayment(totalAmount, currency);
                    break;
            }

            // Update escrow with payment intent ID
            if (paymentIntent) {
                await prisma.escrowTransaction.update({
                    where: { id: escrowTransaction.id },
                    data: { paymentIntentId: paymentIntent.id }
                });
            }

            return {
                success: true,
                escrowTransactionId: escrowTransaction.id,
                paymentIntent
            };

        } catch (error) {
            console.error('Error creating escrow transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Lock funds in escrow after successful payment
     */
    static async lockFunds(escrowTransactionId: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const escrowTransaction = await prisma.escrowTransaction.findUnique({
                where: { id: escrowTransactionId }
            });

            if (!escrowTransaction) {
                throw new Error('Escrow transaction not found');
            }

            if (escrowTransaction.status !== 'PENDING') {
                throw new Error('Escrow transaction is not in pending status');
            }

            // Verify payment with payment provider
            const paymentVerified = await this.verifyPayment(escrowTransaction);
            if (!paymentVerified) {
                throw new Error('Payment verification failed');
            }

            // Lock funds in escrow
            await prisma.escrowTransaction.update({
                where: { id: escrowTransactionId },
                data: {
                    status: 'LOCKED',
                    lockedAt: new Date()
                }
            });

            // Update stake status to active
            await prisma.stake.update({
                where: { id: escrowTransaction.stakeId },
                data: { status: 'ACTIVE' }
            });

            return { success: true };

        } catch (error) {
            console.error('Error locking funds:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Release funds from escrow after successful stake completion
     */
    static async releaseFunds(
        escrowTransactionId: string,
        releaseType: 'REWARD' | 'REFUND' | 'PENALTY'
    ): Promise<{
        success: boolean;
        transactionId?: string;
        error?: string;
    }> {
        try {
            const escrowTransaction = await prisma.escrowTransaction.findUnique({
                where: { id: escrowTransactionId },
                include: { stake: true }
            });

            if (!escrowTransaction) {
                throw new Error('Escrow transaction not found');
            }

            if (escrowTransaction.status !== 'LOCKED') {
                throw new Error('Funds are not locked in escrow');
            }

            let releaseAmount: number;
            let recipientId: string;

            switch (releaseType) {
                case 'REWARD':
                    // Calculate reward amount based on stake completion
                    const rewardAmount = await this.calculateRewardAmount(escrowTransaction);
                    releaseAmount = rewardAmount;
                    recipientId = escrowTransaction.userId;
                    break;
                case 'REFUND':
                    // Full refund to user
                    releaseAmount = Number(escrowTransaction.amount);
                    recipientId = escrowTransaction.userId;
                    break;
                case 'PENALTY':
                    // Penalty goes to platform/charity
                    releaseAmount = Number(escrowTransaction.amount);
                    recipientId = 'platform'; // Platform account
                    break;
            }

            // Process payment to recipient
            const paymentResult = await this.processPayment({
                amount: releaseAmount,
                currency: escrowTransaction.currency,
                recipientId,
                paymentMethod: escrowTransaction.paymentMethod,
                description: `Stake ${releaseType.toLowerCase()} - ${escrowTransaction.stake.title}`
            });

            if (!paymentResult.success) {
                throw new Error('Payment processing failed');
            }

            // Update escrow status
            await prisma.escrowTransaction.update({
                where: { id: escrowTransactionId },
                data: {
                    status: 'RELEASED',
                    releasedAt: new Date(),
                    releaseType,
                    releaseAmount: Number(releaseAmount),
                    externalTransactionId: paymentResult.transactionId
                }
            });

            return {
                success: true,
                transactionId: paymentResult.transactionId
            };

        } catch (error) {
            console.error('Error releasing funds:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process automatic refund for failed stakes
     */
    static async processRefund(escrowTransactionId: string, reason: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const result = await this.releaseFunds(escrowTransactionId, 'REFUND');

            if (result.success) {
                // Update escrow status to refunded
                await prisma.escrowTransaction.update({
                    where: { id: escrowTransactionId },
                    data: {
                        status: 'REFUNDED',
                        refundedAt: new Date(),
                        failureReason: reason
                    }
                });
            }

            return result;

        } catch (error) {
            console.error('Error processing refund:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Calculate escrow fees
     */
    private static calculateEscrowFee(amount: number): number {
        // Stripe: 2.9% + $0.30 per transaction
        return (amount * 0.029) + 0.30;
    }

    /**
     * Calculate platform fees
     */
    private static calculatePlatformFee(amount: number): number {
        return amount * (this.CONFIG.platformFeePercentage / 100);
    }

    /**
     * Create Stripe payment intent
     */
    private static async createStripePaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
        // This would integrate with Stripe API
        // For now, returning mock data
        return {
            id: `pi_${Date.now()}`,
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            status: 'requires_payment_method',
            client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    /**
     * Create PayPal order
     */
    private static async createPayPalOrder(amount: number, currency: string): Promise<PaymentIntent> {
        // This would integrate with PayPal API
        return {
            id: `pp_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            status: 'requires_payment_method',
            client_secret: `pp_${Date.now()}_secret`
        };
    }

    /**
     * Create bank transfer
     */
    private static async createBankTransfer(amount: number, currency: string): Promise<PaymentIntent> {
        // This would integrate with bank transfer API
        return {
            id: `bt_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            status: 'requires_confirmation',
            client_secret: `bt_${Date.now()}_secret`
        };
    }

    /**
     * Create crypto payment
     */
    private static async createCryptoPayment(amount: number, currency: string): Promise<PaymentIntent> {
        // This would integrate with crypto payment API
        return {
            id: `crypto_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            status: 'requires_payment_method',
            client_secret: `crypto_${Date.now()}_secret`
        };
    }

    /**
     * Verify payment with provider
     */
    private static async verifyPayment(escrowTransaction: any): Promise<boolean> {
        // This would verify payment with the respective provider
        // For now, returning true for demo
        return true;
    }

    /**
     * Calculate reward amount
     */
    private static async calculateRewardAmount(escrowTransaction: any): Promise<number> {
        // This would calculate rewards based on stake completion
        // For now, returning the original amount
        return Number(escrowTransaction.amount);
    }

    /**
     * Process payment to recipient
     */
    private static async processPayment(paymentData: {
        amount: number;
        currency: string;
        recipientId: string;
        paymentMethod: string;
        description: string;
    }): Promise<{
        success: boolean;
        transactionId?: string;
        error?: string;
    }> {
        // This would process payment to the recipient
        // For now, returning mock success
        return {
            success: true,
            transactionId: `tx_${Date.now()}`
        };
    }

    /**
     * Get escrow transaction status
     */
    static async getEscrowStatus(escrowTransactionId: string): Promise<{
        status: string;
        amount: number;
        currency: string;
        lockedAt?: Date;
        releasedAt?: Date;
        refundedAt?: Date;
    } | null> {
        const escrowTransaction = await prisma.escrowTransaction.findUnique({
            where: { id: escrowTransactionId }
        });

        if (!escrowTransaction) {
            return null;
        }

        return {
            status: escrowTransaction.status,
            amount: Number(escrowTransaction.amount),
            currency: escrowTransaction.currency,
            lockedAt: escrowTransaction.lockedAt || undefined,
            releasedAt: escrowTransaction.releasedAt || undefined,
            refundedAt: escrowTransaction.refundedAt || undefined
        };
    }

    /**
     * Get user's escrow transactions
     */
    static async getUserEscrowTransactions(userId: string): Promise<EscrowTransaction[]> {
        const transactions = await prisma.escrowTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return transactions.map(tx => ({
            id: tx.id,
            stakeId: tx.stakeId,
            userId: tx.userId,
            amount: Number(tx.amount),
            currency: tx.currency,
            status: tx.status as any,
            paymentMethod: tx.paymentMethod as any,
            paymentIntentId: tx.paymentIntentId || undefined,
            escrowAccountId: tx.escrowAccountId || undefined,
            lockedAt: tx.lockedAt || undefined,
            releasedAt: tx.releasedAt || undefined,
            refundedAt: tx.refundedAt || undefined,
            failureReason: tx.failureReason || undefined,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt
        }));
    }
}
