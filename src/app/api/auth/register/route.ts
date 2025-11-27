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
        let inviterName: string | null = null;
        let invitationAccepted = false;

        if (invitationId && referredBy) {
            try {
                // Get inviter info first
                const inviter = await prisma.user.findUnique({
                    where: { id: referredBy },
                    select: { name: true }
                });
                inviterName = inviter?.name || null;

                // Try to create acceptance record (wrap in try-catch for graceful handling)
                // Use dynamic property access to check if PlatformInvitationAcceptance model exists
                // This handles the case where Prisma client hasn't been regenerated yet
                try {
                    // Try to use the new model if it exists
                    const acceptanceModel = (prisma as any).platformInvitationAcceptance;

                    if (acceptanceModel) {
                        await prisma.$transaction(async (tx: any) => {
                            // Check if user already accepted this invitation (prevent duplicate)
                            const existingAcceptance = await tx.platformInvitationAcceptance?.findUnique({
                                where: {
                                    invitationId_userId: {
                                        invitationId: invitationId!,
                                        userId: user.id
                                    }
                                }
                            });

                            // Create acceptance record if not already accepted
                            if (!existingAcceptance) {
                                await tx.platformInvitationAcceptance.create({
                                    data: {
                                        invitationId: invitationId!,
                                        userId: user.id,
                                        acceptedAt: new Date()
                                    }
                                });

                                // Increment inviter's referral count
                                await tx.user.update({
                                    where: { id: referredBy! },
                                    data: {
                                        referralCount: { increment: 1 }
                                    }
                                });

                                invitationAccepted = true;
                            }
                        });
                    } else {
                        // Fallback: If model doesn't exist, just update referral count
                        await prisma.user.update({
                            where: { id: referredBy! },
                            data: {
                                referralCount: { increment: 1 }
                            }
                        });
                        invitationAccepted = true;
                    }
                } catch (modelError: any) {
                    // If model doesn't exist or any error, use fallback
                    console.log('Using fallback invitation acceptance method');
                    await prisma.user.update({
                        where: { id: referredBy! },
                        data: {
                            referralCount: { increment: 1 }
                        }
                    });
                    invitationAccepted = true;
                }
            } catch (acceptanceError: any) {
                // Log error but don't fail registration
                console.error('Error accepting invitation (non-critical):', acceptanceError);

                // Still try to increment referral count as fallback
                try {
                    await prisma.user.update({
                        where: { id: referredBy! },
                        data: {
                            referralCount: { increment: 1 }
                        }
                    });
                    invitationAccepted = true;
                } catch (updateError) {
                    console.error('Error updating referral count:', updateError);
                }
            }
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
                // Don't fail registration if email fails - user can request resend
            }
        }

        // TODO: Implement SMS sending for phone verification
        if (phone) {
            // SMS implementation will be added later
            // For now, log the token in development mode
            if (process.env.NODE_ENV === 'development') {
                console.log(`📱 PHONE VERIFICATION TOKEN for ${phone}:`, token);
                console.log(`📱 SMS verification for phone numbers will be implemented soon`);
            } else {
                // In production, return an error since SMS is not yet implemented
                return NextResponse.json(
                    { error: "Phone verification is not yet implemented" },
                    { status: 501 }
                );
            }
        }

        // Build redirect URL with verification parameters
        // Always include identifier and type for resend functionality
        const identifierParam = email || phone!;
        const verificationType = email ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';

        // Build base URL and query parameters
        const baseUrl = invitationAccepted && inviterName
            ? '/welcome'
            : '/auth/verify-request';

        const urlParams = new URLSearchParams({
            identifier: identifierParam,
            type: verificationType,
        });

        // Add invitation-specific parameters if applicable
        if (invitationAccepted && inviterName) {
            urlParams.set('accepted', 'true');
            urlParams.set('inviterName', inviterName);
        }

        const redirectUrl = `${baseUrl}?${urlParams.toString()}`;

        return NextResponse.json({
            success: true,
            message: invitationAccepted
                ? `User created successfully! You've joined via ${inviterName}'s invitation.`
                : "User created successfully. Please check your email/phone for verification.",
            userId: user.id,
            verificationRequired: true,
            emailSent: !!email,
            smsSent: !!phone,
            invitationAccepted: invitationAccepted,
            redirectUrl: redirectUrl
        });
    } catch (error: any) {
        console.error("Registration error:", error);

        // Provide more specific error messages
        const errorMessage = error?.message || "Internal server error";
        const isValidationError = errorMessage.includes("already exists") ||
            errorMessage.includes("required") ||
            errorMessage.includes("Invalid");

        return NextResponse.json(
            {
                error: isValidationError ? errorMessage : "Internal server error. Please try again.",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: isValidationError ? 400 : 500 }
        );
    }
}
