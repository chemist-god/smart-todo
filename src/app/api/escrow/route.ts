import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EscrowService } from "@/lib/escrow-service";
import { PaymentService } from "@/lib/payment-service";
import { SecurityService } from "@/lib/security-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const createEscrowSchema = z.object({
    stakeId: z.string().min(1),
    amount: z.number().min(5).max(10000),
    currency: z.string().default("USD"),
    paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'CRYPTO']).default('STRIPE')
});

// POST /api/escrow - Create escrow transaction
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { stakeId, amount, currency, paymentMethod } = createEscrowSchema.parse(body);

        // Get client IP and user agent for security checks
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || '';

        // Security validation
        const securityCheck = await SecurityService.validateStakeCreation(
            user.id,
            amount,
            'SELF_STAKE',
            ipAddress,
            userAgent
        );

        if (!securityCheck.isValid) {
            return NextResponse.json({
                error: "Security validation failed",
                violations: securityCheck.violations,
                recommendations: securityCheck.recommendations,
                riskLevel: securityCheck.riskLevel
            }, { status: 400 });
        }

        // Create escrow transaction
        const escrowResult = await EscrowService.createEscrowTransaction(
            stakeId,
            user.id,
            amount,
            currency,
            paymentMethod
        );

        if (!escrowResult.success) {
            return NextResponse.json(
                { error: escrowResult.error },
                { status: 400 }
            );
        }

        // Create payment intent
        const paymentResult = await PaymentService.createPaymentIntent(
            amount,
            currency,
            user.id,
            stakeId
        );

        if (!paymentResult.success) {
            return NextResponse.json(
                { error: paymentResult.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            escrowTransactionId: escrowResult.escrowTransactionId,
            paymentIntent: {
                id: paymentResult.transactionId,
                clientSecret: paymentResult.clientSecret,
                requiresAction: paymentResult.requiresAction,
                nextAction: paymentResult.nextAction
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

// GET /api/escrow - Get user's escrow transactions
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const transactions = await EscrowService.getUserEscrowTransactions(user.id);

        return NextResponse.json({
            transactions,
            total: transactions.length
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
