import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EnhancedPenaltyService } from "@/lib/enhanced-penalty-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const partialCompletionSchema = z.object({
    completionPercentage: z.number().min(25).max(99), // 25% minimum, 99% maximum
    evidence: z.string().optional()
});

// POST /api/stakes/[id]/partial-completion - Submit partial completion
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: stakeId } = await params;
        const body = await request.json();
        const { completionPercentage, evidence } = partialCompletionSchema.parse(body);

        const result = await EnhancedPenaltyService.processPartialCompletion(
            stakeId,
            completionPercentage,
            evidence
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            penaltyAmount: result.penaltyAmount,
            partialCompletion: result.partialCompletion,
            message: "Partial completion processed successfully"
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
