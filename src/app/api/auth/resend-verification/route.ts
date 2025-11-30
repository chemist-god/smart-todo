import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sendEmail, generateVerificationEmailHtml, generateVerificationEmailText } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { identifier, type } = await request.json();

        if (!identifier || !type) {
            return NextResponse.json(
                { error: "Identifier and type are required" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                ],
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if already verified
        if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
            return NextResponse.json(
                { error: "Email already verified" },
                { status: 400 }
            );
        }

        if (type === "PHONE_VERIFICATION" && user.phoneVerified) {
            return NextResponse.json(
                { error: "Phone already verified" },
                { status: 400 }
            );
        }

        // Delete existing tokens for this identifier and type
        await prisma.verificationToken.deleteMany({
            where: {
                identifier,
                type,
            },
        });

        // Generate new verification token
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier,
                token,
                type,
                expires,
                userId: user.id,
            },
        });

        // Send verification email/SMS
        // Use the identifier from the request (already declared above)

        // Send email for email verification
        if (type === "EMAIL_VERIFICATION") {
            const emailResult = await sendEmail({
                to: identifier,
                subject: "Verify Your SoulLedger Account",
                html: generateVerificationEmailHtml(token, 'email', identifier),
                text: generateVerificationEmailText(token, 'email', identifier),
            });

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
                return NextResponse.json(
                    { error: "Failed to send verification email" },
                    { status: 500 }
                );
            }
        }

        // TODO: Implement SMS sending for phone verification
        if (type === "PHONE_VERIFICATION") {
            // SMS implementation will be added later
            // For now, log the token in development mode
            if (process.env.NODE_ENV === 'development') {
                console.log(`📱 PHONE VERIFICATION TOKEN (RESEND) for ${identifier}:`, token);
                console.log(`📱 SMS verification for phone numbers will be implemented soon`);
            } else {
                // In production, return an error since SMS is not yet implemented
                return NextResponse.json(
                    { error: "Phone verification is not yet implemented" },
                    { status: 501 }
                );
            }
        }

        return NextResponse.json({
            message: "Verification token sent successfully",
            emailSent: type === "EMAIL_VERIFICATION",
            smsSent: type === "PHONE_VERIFICATION",
            token: process.env.NODE_ENV === 'development' ? token : undefined, // Only return token in dev mode
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
