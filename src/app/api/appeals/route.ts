import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppealService } from "@/lib/appeal-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const submitAppealSchema = z.object({
    stakeId: z.string().min(1),
    reason: z.string().min(10).max(500),
    evidence: z.string().optional()
});

// POST /api/appeals - Submit an appeal
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { stakeId, reason, evidence } = submitAppealSchema.parse(body);

        const result = await AppealService.submitAppeal({
            stakeId,
            userId: user.id,
            reason,
            evidence
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            appealId: result.appealId,
            message: "Appeal submitted successfully"
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// GET /api/appeals - Get user's appeals
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const appeals = await AppealService.getUserAppeals(user.id, status || undefined);

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
