import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RecoveryStakeService } from "@/lib/recovery-stake-service";
import { handleApiError } from "@/lib/error-handler";

// GET /api/recovery-stakes/eligibility/[stakeId] - Check if stake is eligible for recovery
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ stakeId: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { stakeId } = await params;

        const eligibility = await RecoveryStakeService.isEligibleForRecovery(stakeId, user.id);

        return NextResponse.json(eligibility);

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
