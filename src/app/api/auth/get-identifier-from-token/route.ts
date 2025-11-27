import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Helper endpoint to get identifier (email/phone) from a verification token
 * This is used by the resend verification flow when identifier is not in URL
 */
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        // Find verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Invalid verification token" },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (verificationToken.expires < new Date()) {
            return NextResponse.json(
                { error: "Verification token has expired" },
                { status: 400 }
            );
        }

        // Return identifier and type
        return NextResponse.json({
            identifier: verificationToken.identifier,
            type: verificationToken.type,
        });
    } catch (error) {
        console.error("Get identifier from token error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

