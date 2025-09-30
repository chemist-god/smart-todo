import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Increment like count (joinCount as proxy for likes)
        await prisma.stake.update({
            where: { id },
            data: {
                joinCount: {
                    increment: 1
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error incrementing like count:", error);
        return NextResponse.json(
            { error: "Failed to record like" },
            { status: 500 }
        );
    }
}
