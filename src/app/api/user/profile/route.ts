import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/profile
 * Get current user's profile information
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;

        if (!user || !user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                username: true,
                image: true,
            },
        });

        if (!userProfile) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

