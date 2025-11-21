import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/error-handler";

// GET /api/invite/[code] - Fetch invite by code (supports both stake and platform invitations)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // First, try to find as platform invitation (by inviteCode)
        let platformInvitation = await prisma.platformInvitation.findUnique({
            where: { inviteCode: code },
            include: {
                inviter: {
                    select: {
                        name: true,
                        image: true,
                        email: true
                    }
                }
            }
        });

        // If not found, check if it's a referral code from User table
        // If so, create a platform invitation on-the-fly
        if (!platformInvitation) {
            const userWithReferralCode = await prisma.user.findUnique({
                where: { referralCode: code },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                    referralCode: true
                }
            });

            if (userWithReferralCode && userWithReferralCode.referralCode === code) {
                // Create or get platform invitation for this referral code (use upsert to avoid race conditions)
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

                // Try to find existing first
                platformInvitation = await prisma.platformInvitation.findFirst({
                    where: { inviteCode: code },
                    include: {
                        inviter: {
                            select: {
                                name: true,
                                image: true,
                                email: true
                            }
                        }
                    }
                });

                // If not found, create one (wrap in try-catch for race condition)
                if (!platformInvitation) {
                    try {
                        platformInvitation = await prisma.platformInvitation.create({
                            data: {
                                inviterId: userWithReferralCode.id,
                                inviteCode: code,
                                inviteeEmail: null,
                                inviteePhone: null,
                                status: 'PENDING',
                                expiresAt,
                                shareMethod: 'LINK'
                            },
                            include: {
                                inviter: {
                                    select: {
                                        name: true,
                                        image: true,
                                        email: true
                                    }
                                }
                            }
                        });
                    } catch (error: any) {
                        // If unique constraint error, another request created it - fetch it
                        if (error?.code === 'P2002') {
                            platformInvitation = await prisma.platformInvitation.findFirst({
                                where: { inviteCode: code },
                                include: {
                                    inviter: {
                                        select: {
                                            name: true,
                                            image: true,
                                            email: true
                                        }
                                    }
                                }
                            });
                        } else {
                            throw error;
                        }
                    }
                }
            }
        }

        if (platformInvitation) {
            // Check if invitation is expired
            const now = new Date();
            const isExpired = platformInvitation.expiresAt < now;

            if (isExpired && platformInvitation.status === 'PENDING') {
                await prisma.platformInvitation.update({
                    where: { inviteCode: code },
                    data: { status: 'EXPIRED' }
                });
                platformInvitation.status = 'EXPIRED';
            }

            // Get acceptance count and check if current user has accepted
            // Use dynamic access to handle Prisma client not regenerated yet
            let acceptanceCount = 0;
            let userAcceptance = null;

            const acceptanceModel = (prisma as any).platformInvitationAcceptance;
            if (acceptanceModel) {
                try {
                    // Try to count - if this fails, table doesn't exist yet
                    acceptanceCount = await acceptanceModel.count({
                        where: { invitationId: platformInvitation.id }
                    });

                    // Get user from session if available
                    try {
                        const session = await auth();
                        if (session?.user?.id) {
                            try {
                                userAcceptance = await acceptanceModel.findUnique({
                                    where: {
                                        invitationId_userId: {
                                            invitationId: platformInvitation.id,
                                            userId: session.user.id
                                        }
                                    }
                                });
                            } catch (findError) {
                                // Table might not exist, continue without user acceptance check
                                console.log('Acceptance table not available for user check');
                            }
                        }
                    } catch (sessionError) {
                        // No session or error, continue without user acceptance check
                    }
                } catch (countError: any) {
                    // Table doesn't exist yet - continue with defaults
                    console.log('Acceptance table not available yet, using defaults');
                }
            }

            // Track view
            await prisma.platformInvitation.update({
                where: { inviteCode: code },
                data: {
                    viewCount: { increment: 1 },
                    lastViewedAt: new Date()
                }
            });

            return NextResponse.json({
                type: 'PLATFORM',
                invitation: {
                    id: platformInvitation.id,
                    inviteCode: platformInvitation.inviteCode,
                    inviterName: platformInvitation.inviter.name || 'Someone',
                    inviterImage: platformInvitation.inviter.image,
                    inviterEmail: platformInvitation.inviter.email,
                    status: platformInvitation.status,
                    expiresAt: platformInvitation.expiresAt.toISOString(),
                    createdAt: platformInvitation.createdAt.toISOString(),
                    viewCount: platformInvitation.viewCount + 1,
                    acceptanceCount,
                    userHasAccepted: !!userAcceptance
                }
            });
        }

        // If not platform invitation, try stake invitation (by securityCode)
        const stakeInvitation = await prisma.stakeInvitation.findUnique({
            where: { securityCode: code },
            include: {
                stake: {
                    select: {
                        title: true,
                        userStake: true,
                        deadline: true,
                        status: true,
                        stakeType: true
                    }
                },
                inviter: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });

        if (!stakeInvitation) {
            throw new NotFoundError("Invitation not found");
        }

        // Check if invitation is expired
        const now = new Date();
        const isExpired = stakeInvitation.expiresAt < now;
        if (isExpired && stakeInvitation.status === 'PENDING') {
            await prisma.stakeInvitation.update({
                where: { securityCode: code },
                data: { status: 'EXPIRED' }
            });
            stakeInvitation.status = 'EXPIRED';
        }

        if (stakeInvitation.stake.status !== 'ACTIVE') {
            throw new ValidationError("This stake is no longer active");
        }

        // Track view
        await prisma.stakeInvitation.update({
            where: { securityCode: code },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date()
            }
        });

        return NextResponse.json({
            type: 'STAKE',
            invitation: {
                id: stakeInvitation.id,
                stakeId: stakeInvitation.stakeId,
                inviterName: stakeInvitation.inviter.name || 'Anonymous',
                inviterImage: stakeInvitation.inviter.image,
                stakeTitle: stakeInvitation.stake.title,
                stakeAmount: Number(stakeInvitation.stake.userStake),
                deadline: stakeInvitation.stake.deadline.toISOString(),
                message: stakeInvitation.message,
                status: stakeInvitation.status,
                expiresAt: stakeInvitation.expiresAt.toISOString(),
                createdAt: stakeInvitation.createdAt.toISOString(),
                securityCode: stakeInvitation.securityCode
            }
        });
    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
