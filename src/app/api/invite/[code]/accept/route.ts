import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";

// POST /api/invite/[code]/accept - Accept platform invitation
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await params;

        // Find platform invitation
        const invitation = await prisma.platformInvitation.findUnique({
            where: { inviteCode: code },
            include: {
                inviter: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!invitation) {
            throw new NotFoundError("Invitation not found");
        }

        // Validation checks
        if (invitation.status !== 'PENDING') {
            throw new ValidationError("Invitation is no longer valid");
        }

        if (invitation.expiresAt < new Date()) {
            throw new ValidationError("Invitation has expired");
        }

        // Check if user is trying to accept their own invitation
        if (invitation.inviterId === user.id) {
            throw new ValidationError("Cannot accept your own invitation");
        }

        // Check if user already accepted an invitation
        const existingAcceptance = await prisma.user.findUnique({
            where: { id: user.id },
            select: { acceptedInvitation: true }
        });

        if (existingAcceptance?.acceptedInvitation) {
            throw new ValidationError("You have already accepted an invitation");
        }

        // Check if this invitation was already accepted by someone else
        if (invitation.acceptedBy) {
            throw new ValidationError("This invitation has already been accepted");
        }

        // Optional: Check if inviteeEmail matches (if provided)
        if (invitation.inviteeEmail && invitation.inviteeEmail !== user.email) {
            // Allow but log mismatch
            console.warn(`Invitation email mismatch: expected ${invitation.inviteeEmail}, got ${user.email}`);
        }

        // Start transaction to accept invitation
        const result = await prisma.$transaction(async (tx) => {
            // Update invitation status
            await tx.platformInvitation.update({
                where: { inviteCode: code },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date(),
                    acceptedBy: user.id
                }
            });

            // Update user's referral info
            await tx.user.update({
                where: { id: user.id },
                data: {
                    referredBy: invitation.inviterId
                }
            });

            // Increment inviter's referral count
            await tx.user.update({
                where: { id: invitation.inviterId },
                data: {
                    referralCount: { increment: 1 }
                }
            });

            return {
                inviterName: invitation.inviter.name || 'Your friend'
            };
        });

        return NextResponse.json({
            success: true,
            message: `You've successfully joined via ${result.inviterName}'s invitation!`,
            inviterName: result.inviterName
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

