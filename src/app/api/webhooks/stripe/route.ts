import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment-service";
import { EscrowService } from "@/lib/escrow-service";
import { handleApiError } from "@/lib/error-handler";

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: "Missing stripe-signature header" },
                { status: 400 }
            );
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return NextResponse.json(
                { error: "Webhook secret not configured" },
                { status: 500 }
            );
        }

        // Verify webhook signature and handle event
        const result = await PaymentService.handleWebhook(
            body,
            signature,
            webhookSecret
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
