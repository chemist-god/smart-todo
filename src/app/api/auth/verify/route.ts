import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { token, type } = await request.json();

        if (!token || !type) {
            return NextResponse.json(
                { error: "Token and type are required" },
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
            await prisma.verificationToken.delete({
                where: { id: verificationToken.id },
            });
            return NextResponse.json(
                { error: "Verification token has expired" },
                { status: 400 }
            );
        }

        // Check token type
        if (verificationToken.type !== type) {
            return NextResponse.json(
                { error: "Invalid token type" },
                { status: 400 }
            );
        }

        // Update user verification status
        const updateData: any = {};
        if (type === "EMAIL_VERIFICATION") {
            updateData.emailVerified = new Date();
        } else if (type === "PHONE_VERIFICATION") {
            updateData.phoneVerified = new Date();
        }

        await prisma.user.update({
            where: { id: verificationToken.userId! },
            data: updateData,
        });

        // Delete the used token
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
        });

        return NextResponse.json({
            message: "Account verified successfully",
            verified: true,
        });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
