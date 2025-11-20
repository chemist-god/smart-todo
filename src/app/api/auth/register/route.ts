import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { sendEmail, generateVerificationEmailHtml, generateVerificationEmailText } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, password, inviteCode } = await request.json();

        // Validate required fields
        if (!email && !phone) {
            return NextResponse.json(
                { error: "Email or phone number is required" },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: "Password is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { phone: phone || undefined },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or phone already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Validate and process invite code if provided
        let referredBy: string | null = null;
        let invitationId: string | null = null;

        if (inviteCode) {
            const invitation = await prisma.platformInvitation.findUnique({
                where: { inviteCode },
                include: { inviter: { select: { id: true } } }
            });

            if (invitation && invitation.status === 'PENDING' && invitation.expiresAt > new Date()) {
                // Check if invitation email/phone matches (if provided)
                const emailMatches = !invitation.inviteeEmail || invitation.inviteeEmail === email;
                const phoneMatches = !invitation.inviteePhone || invitation.inviteePhone === phone;

                if (emailMatches && phoneMatches) {
                    referredBy = invitation.inviterId;
                    invitationId = invitation.id;
                }
            }
        }

        // Create user with referral info
        const user = await prisma.user.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                password: hashedPassword,
                referredBy: referredBy || null,
            },
        });

        // If invitation was valid, accept it
        if (invitationId && referredBy) {
            await prisma.$transaction(async (tx) => {
                // Accept invitation
                await tx.platformInvitation.update({
                    where: { id: invitationId! },
                    data: {
                        status: 'ACCEPTED',
                        acceptedAt: new Date(),
                        acceptedBy: user.id
                    }
                });

                // Increment inviter's referral count
                await tx.user.update({
                    where: { id: referredBy! },
                    data: {
                        referralCount: { increment: 1 }
                    }
                });
            });
        }

        // Generate verification token
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier: email || phone!,
                token,
                type: email ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION",
                expires,
                userId: user.id,
            },
        });

        // Send verification email/SMS
        const identifier = email || phone!;

        // Send email for email verification
        if (email) {
            const emailResult = await sendEmail({
                to: email,
                subject: "Verify Your Smart Todo Account",
                html: generateVerificationEmailHtml(token, 'email', email),
                text: generateVerificationEmailText(token, 'email', email),
            });

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
            }
        }

        // TODO: Implement SMS sending for phone verification
        if (phone) {
            // SMS implementation will be added later
            console.log(`📱 SMS verification for phone numbers will be implemented soon`);
        }

        return NextResponse.json({
            message: "User created successfully. Please check your email/phone for verification.",
            userId: user.id,
            verificationRequired: true,
            emailSent: !!email,
            smsSent: !!phone,
            invitationAccepted: !!invitationId,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
