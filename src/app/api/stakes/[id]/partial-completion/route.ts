import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EnhancedPenaltyService } from "@/lib/enhanced-penalty-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const partialCompletionSchema = z.object({
    completionPercentage: z.number().min(25).max(99),
    evidence: z.string().optional(),
    description: z.string().min(10).max(500),
    challenges: z.string().optional(),
    nextSteps: z.string().optional()
});

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

        const { id } = await params;
        const body = await request.json();
        const validatedData = partialCompletionSchema.parse(body);

        const result = await EnhancedPenaltyService.processPartialCompletion({
            stakeId: id,
            userId: user.id,
            completionPercentage: validatedData.completionPercentage,
            evidence: validatedData.evidence,
            description: validatedData.description,
            challenges: validatedData.challenges,
            nextSteps: validatedData.nextSteps
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Partial completion submitted successfully",
            penaltyReduction: result.penaltyReduction,
            newPenalty: result.newPenalty
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}