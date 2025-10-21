import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";
import { SecurityService } from "./security-service";

export interface PaymentProvider {
    name: 'stripe' | 'paypal' | 'bank' | 'crypto';
    config: any;
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    clientSecret?: string;
    error?: string;
    requiresAction?: boolean;
    nextAction?: any;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
}

export class PaymentService {
    private static stripe: Stripe;
    private static providers: Map<string, PaymentProvider> = new Map();

    static initialize() {
        // Initialize Stripe
        if (process.env.STRIPE_SECRET_KEY) {
            this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

            this.providers.set('stripe', {
                name: 'stripe',
                config: {
                    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
                }
            });
        }

        // Initialize other providers
        if (process.env.PAYPAL_CLIENT_ID) {
            this.providers.set('paypal', {
                name: 'paypal',
                config: {
                    clientId: process.env.PAYPAL_CLIENT_ID,
                    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
                    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
                }
            });
        }
    }

    /**
     * Create payment intent for stake
     */
    static async createPaymentIntent(
        amount: number,
        currency: string,
        userId: string,
        stakeId: string,
        paymentMethodId?: string
    ): Promise<PaymentResult> {
        try {
            // Security validation
            const securityCheck = await SecurityService.validateStakeCreation(
                userId,
                amount,
                'SELF_STAKE',
                '127.0.0.1', // This should come from request
                'Mozilla/5.0...' // This should come from request
            );

            if (!securityCheck.isValid) {
                return {
                    success: false,
                    error: `Security validation failed: ${securityCheck.violations.join(', ')}`
                };
            }

            // Create Stripe payment intent
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                metadata: {
                    userId,
                    stakeId,
                    type: 'stake_creation'
                },
                automatic_payment_methods: {
                    enabled: true,
                },
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: false
            });

            // Store payment intent in database
            await prisma.paymentIntent.create({
                data: {
                    id: paymentIntent.id,
                    userId,
                    stakeId,
                    amount: amount,
                    currency,
                    status: paymentIntent.status as any,
                    clientSecret: paymentIntent.client_secret,
                    metadata: paymentIntent.metadata
                }
            });

            return {
                success: true,
                transactionId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret || undefined,
                requiresAction: paymentIntent.status === 'requires_action',
                nextAction: paymentIntent.next_action
            };

        } catch (error) {
            console.error('Error creating payment intent:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Confirm payment intent
     */
    static async confirmPaymentIntent(
        paymentIntentId: string,
        paymentMethodId?: string
    ): Promise<PaymentResult> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(
                paymentIntentId,
                {
                    payment_method: paymentMethodId
                }
            );

            // Update database
            await prisma.paymentIntent.update({
                where: { id: paymentIntentId },
                data: {
                    status: paymentIntent.status as any,
                    paymentMethodId: paymentMethodId
                }
            });

            return {
                success: paymentIntent.status === 'succeeded',
                transactionId: paymentIntent.id,
                error: paymentIntent.status === 'requires_action' ? 'Additional authentication required' : undefined,
                requiresAction: paymentIntent.status === 'requires_action',
                nextAction: paymentIntent.next_action
            };

        } catch (error) {
            console.error('Error confirming payment intent:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process refund
     */
    static async processRefund(
        paymentIntentId: string,
        amount?: number,
        reason?: string
    ): Promise<RefundResult> {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason: reason as any
            });

            return {
                success: refund.status === 'succeeded',
                refundId: refund.id,
                amount: refund.amount / 100 // Convert back to dollars
            };

        } catch (error) {
            console.error('Error processing refund:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Handle webhook events
     */
    static async handleWebhook(
        payload: string,
        signature: string,
        endpointSecret: string
    ): Promise<{
        success: boolean;
        event?: any;
        error?: string;
    }> {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                endpointSecret
            );

            // Handle different event types
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'charge.dispute.created':
                    await this.handleChargeDispute(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return {
                success: true,
                event
            };

        } catch (error) {
            console.error('Error handling webhook:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Handle successful payment
     */
    private static async handlePaymentSucceeded(paymentIntent: any) {
        // Update escrow transaction status
        const escrowTransaction = await prisma.escrowTransaction.findFirst({
            where: { paymentIntentId: paymentIntent.id }
        });

        if (escrowTransaction) {
            await prisma.escrowTransaction.update({
                where: { id: escrowTransaction.id },
                data: {
                    status: 'LOCKED',
                    lockedAt: new Date()
                }
            });

            // Update stake status
            await prisma.stake.update({
                where: { id: escrowTransaction.stakeId },
                data: { status: 'ACTIVE' }
            });
        }
    }

    /**
     * Handle failed payment
     */
    private static async handlePaymentFailed(paymentIntent: any) {
        // Update escrow transaction status
        const escrowTransaction = await prisma.escrowTransaction.findFirst({
            where: { paymentIntentId: paymentIntent.id }
        });

        if (escrowTransaction) {
            await prisma.escrowTransaction.update({
                where: { id: escrowTransaction.id },
                data: {
                    status: 'FAILED',
                    failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
                }
            });
        }
    }

    /**
     * Handle charge dispute
     */
    private static async handleChargeDispute(dispute: any) {
        // Log dispute and potentially freeze account
        console.log('Charge dispute created:', dispute);

        // Update escrow transaction
        const escrowTransaction = await prisma.escrowTransaction.findFirst({
            where: { paymentIntentId: dispute.payment_intent }
        });

        if (escrowTransaction) {
            await prisma.escrowTransaction.update({
                where: { id: escrowTransaction.id },
                data: {
                    status: 'FAILED',
                    failureReason: `Charge dispute: ${dispute.reason}`
                }
            });
        }
    }

    /**
     * Create customer
     */
    static async createCustomer(
        userId: string,
        email: string,
        name?: string
    ): Promise<{
        success: boolean;
        customerId?: string;
        error?: string;
    }> {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: {
                    userId
                }
            });

            // Store customer ID in database
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customer.id }
            });

            return {
                success: true,
                customerId: customer.id
            };

        } catch (error) {
            console.error('Error creating customer:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Save payment method
     */
    static async savePaymentMethod(
        userId: string,
        paymentMethodId: string
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // Attach payment method to customer
            const customer = await this.getOrCreateCustomer(userId);
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customer.id
            });

            // Get payment method details
            const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

            // Save to database
            await prisma.paymentMethod.create({
                data: {
                    userId,
                    provider: 'stripe',
                    providerId: paymentMethodId,
                    type: paymentMethod.type,
                    last4: paymentMethod.card?.last4,
                    brand: paymentMethod.card?.brand,
                    expiryMonth: paymentMethod.card?.exp_month,
                    expiryYear: paymentMethod.card?.exp_year,
                    isVerified: true
                }
            });

            return { success: true };

        } catch (error) {
            console.error('Error saving payment method:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get or create customer
     */
    private static async getOrCreateCustomer(userId: string): Promise<any> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        if (user?.stripeCustomerId) {
            return await this.stripe.customers.retrieve(user.stripeCustomerId);
        }

        // Create new customer
        const customer = await this.stripe.customers.create({
            metadata: { userId }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id }
        });

        return customer;
    }

    /**
     * Get payment methods for user
     */
    static async getPaymentMethods(userId: string): Promise<any[]> {
        const paymentMethods = await prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }
        });

        return paymentMethods;
    }

    /**
     * Set default payment method
     */
    static async setDefaultPaymentMethod(
        userId: string,
        paymentMethodId: string
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            // Update all payment methods to not default
            await prisma.paymentMethod.updateMany({
                where: { userId },
                data: { isDefault: false }
            });

            // Set the selected one as default
            await prisma.paymentMethod.update({
                where: { id: paymentMethodId },
                data: { isDefault: true }
            });

            return { success: true };

        } catch (error) {
            console.error('Error setting default payment method:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Delete payment method
     */
    static async deletePaymentMethod(
        userId: string,
        paymentMethodId: string
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const paymentMethod = await prisma.paymentMethod.findFirst({
                where: { id: paymentMethodId, userId }
            });

            if (!paymentMethod) {
                return {
                    success: false,
                    error: 'Payment method not found'
                };
            }

            // Detach from Stripe
            await this.stripe.paymentMethods.detach(paymentMethod.providerId);

            // Delete from database
            await prisma.paymentMethod.delete({
                where: { id: paymentMethodId }
            });

            return { success: true };

        } catch (error) {
            console.error('Error deleting payment method:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

// Initialize payment service
PaymentService.initialize();
