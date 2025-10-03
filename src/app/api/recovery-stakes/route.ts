import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RecoveryStakeService } from "@/lib/recovery-stake-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const createRecoveryStakeSchema = z.object({
    originalStakeId: z.string().min(1),
    title: z.string().min(1).max(100),
    description: z.string().optional(),
    stakeType: z.enum(['SELF_STAKE', 'SOCIAL_STAKE', 'CHALLENGE_STAKE', 'TEAM_STAKE', 'CHARITY_STAKE']),
    userStake: z.number().min(5),
    deadline: z.string().datetime()
});

// POST /api/recovery-stakes - Create a recovery stake
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { originalStakeId, title, description, stakeType, userStake, deadline } = createRecoveryStakeSchema.parse(body);

        const result = await RecoveryStakeService.createRecoveryStake({
            originalStakeId,
            userId: user.id,
            title,
            description,
            stakeType,
            userStake,
            deadline: new Date(deadline)
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            recoveryStakeId: result.recoveryStakeId,
            recoveryTarget: result.recoveryTarget,
            message: "Recovery stake created successfully"
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// GET /api/recovery-stakes - Get user's recovery stakes
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const recoveryStakes = await RecoveryStakeService.getUserRecoveryStakes(user.id);

        return NextResponse.json({
            recoveryStakes,
            total: recoveryStakes.length
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
