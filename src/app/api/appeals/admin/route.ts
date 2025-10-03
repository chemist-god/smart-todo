import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppealService } from "@/lib/appeal-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const reviewAppealSchema = z.object({
    appealId: z.string().min(1),
    decision: z.enum(['APPROVED', 'REJECTED']),
    adminNotes: z.string().optional()
});

// GET /api/appeals/admin - Get all pending appeals (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // TODO: Add admin role check
        // if (!user.isAdmin) {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const appeals = await AppealService.getPendingAppeals();

        return NextResponse.json({
            appeals,
            total: appeals.length
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// POST /api/appeals/admin - Review an appeal (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // TODO: Add admin role check
        // if (!user.isAdmin) {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const body = await request.json();
        const { appealId, decision, adminNotes } = reviewAppealSchema.parse(body);

        const result = await AppealService.reviewAppeal({
            appealId,
            adminId: user.id,
            decision,
            adminNotes
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            refundAmount: result.refundAmount,
            message: `Appeal ${decision.toLowerCase()} successfully`
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
