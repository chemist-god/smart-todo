import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ExtensionService } from "@/lib/extension-service";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

const requestExtensionSchema = z.object({
    stakeId: z.string().min(1),
    newDeadline: z.string().datetime(),
    reason: z.string().optional()
});

// POST /api/extensions - Request a deadline extension
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { stakeId, newDeadline, reason } = requestExtensionSchema.parse(body);

        const result = await ExtensionService.requestExtension({
            stakeId,
            userId: user.id,
            newDeadline: new Date(newDeadline),
            reason
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            extensionId: result.extensionId,
            extensionFee: result.extensionFee,
            newDeadline: result.newDeadline,
            message: "Extension requested successfully"
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// GET /api/extensions - Get user's extensions
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const extensions = await ExtensionService.getUserExtensions(user.id);

        return NextResponse.json({
            extensions,
            total: extensions.length
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
