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

        // Increment view count
        await prisma.stake.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error incrementing view count:", error);
        return NextResponse.json(
            { error: "Failed to record view" },
            { status: 500 }
        );
    }
}
