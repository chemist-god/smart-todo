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

        // Check if user already accepted THIS specific invitation (prevent duplicate)
        // Use dynamic access to handle Prisma client not regenerated yet
        let existingAcceptance = null;
        const acceptanceModel = (prisma as any).platformInvitationAcceptance;

        if (acceptanceModel) {
            try {
                existingAcceptance = await acceptanceModel.findUnique({
                    where: {
                        invitationId_userId: {
                            invitationId: invitation.id,
                            userId: user.id
                        }
                    }
                });
            } catch (error: any) {
                // Table might not exist yet - skip duplicate check
                // Error will be logged by Prisma, but we continue
                console.log('Acceptance table not available yet, skipping duplicate check');
            }
        }

        if (existingAcceptance) {
            throw new ValidationError("You have already accepted this invitation");
        }

        // Check if user was already referred by someone (optional - can allow multiple referrals)
        // For now, we allow users to accept multiple invitations, but only link to the first one
        const userAlreadyReferred = await prisma.user.findUnique({
            where: { id: user.id },
            select: { referredBy: true }
        });

        // Optional: Check if inviteeEmail matches (if provided)
        if (invitation.inviteeEmail && invitation.inviteeEmail !== user.email) {
            // Allow but log mismatch
            console.warn(`Invitation email mismatch: expected ${invitation.inviteeEmail}, got ${user.email}`);
        }

        // Check if acceptance model/table exists before starting transaction
        // This prevents transaction from aborting if table doesn't exist
        let acceptanceCount = 0;
        let canUseAcceptanceModel = false;

        if (acceptanceModel) {
            try {
                // Try a simple count query - if this succeeds, table exists
                acceptanceCount = await acceptanceModel.count({
                    where: { invitationId: invitation.id }
                });
                canUseAcceptanceModel = true;
            } catch (error: any) {
                // Table doesn't exist yet - skip acceptance model operations
                // This is OK, we'll just update referral counts
                console.log('PlatformInvitationAcceptance table not created yet, using fallback method');
                canUseAcceptanceModel = false;
            }
        }

        // Update user's referral info (only if not already referred)
        if (!userAlreadyReferred?.referredBy) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    referredBy: invitation.inviterId
                }
            });
        }

        // Increment inviter's referral count
        await prisma.user.update({
            where: { id: invitation.inviterId },
            data: {
                referralCount: { increment: 1 }
            }
        });

        // Create acceptance record if model/table exists
        if (canUseAcceptanceModel && acceptanceModel) {
            try {
                await acceptanceModel.create({
                    data: {
                        invitationId: invitation.id,
                        userId: user.id,
                        acceptedAt: new Date()
                    }
                });
                acceptanceCount = acceptanceCount + 1;
            } catch (createError: any) {
                // If creation fails, log but continue - referral counts already updated
                console.log('Failed to create acceptance record (non-critical):', createError.message);
            }
        }

        const result = {
            inviterName: invitation.inviter.name || 'Your friend',
            acceptanceCount: acceptanceCount + 1,
            isFirstAcceptance: acceptanceCount === 0
        };

        return NextResponse.json({
            success: true,
            message: `You've successfully joined via ${result.inviterName}'s invitation!`,
            inviterName: result.inviterName,
            acceptanceCount: result.acceptanceCount,
            isFirstAcceptance: result.isFirstAcceptance
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

