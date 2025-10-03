import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ExtensionService } from "@/lib/extension-service";
import { handleApiError } from "@/lib/error-handler";

// GET /api/extensions/eligibility/[stakeId] - Check if stake is eligible for extension
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

        const eligibility = await ExtensionService.isEligibleForExtension(stakeId, user.id);

        return NextResponse.json(eligibility);

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
