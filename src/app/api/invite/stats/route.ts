import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

// GET /api/invite/stats - Get referral statistics
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's referral data
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                referralCode: true,
                referralCount: true,
                referralRewards: true
            }
        });

        // Get platform invitations with acceptance counts
        const [platformInvitations, stakeInvitations, platformAcceptances] = await Promise.all([
            prisma.platformInvitation.findMany({
                where: { inviterId: user.id },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    viewCount: true,
                    _count: {
                        select: {
                            acceptances: true
                        }
                    }
                }
            }),
            prisma.stakeInvitation.findMany({
                where: { inviterId: user.id },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    acceptedAt: true,
                    viewCount: true
                }
            }),
            // Get total acceptance count for all platform invitations
            prisma.platformInvitationAcceptance.count({
                where: {
                    invitation: {
                        inviterId: user.id
                    }
                }
            })
        ]);

        // Calculate statistics
        const totalPlatformInvitations = platformInvitations.length;
        const acceptedPlatformInvitations = platformAcceptances; // Use actual acceptance count
        const pendingPlatformInvitations = platformInvitations.filter(i => i.status === 'PENDING').length;
        const totalPlatformViews = platformInvitations.reduce((sum, i) => sum + i.viewCount, 0);

        const totalStakeInvitations = stakeInvitations.length;
        const acceptedStakeInvitations = stakeInvitations.filter(i => i.status === 'ACCEPTED').length;
        const pendingStakeInvitations = stakeInvitations.filter(i => i.status === 'PENDING').length;
        const totalStakeViews = stakeInvitations.reduce((sum, i) => sum + i.viewCount, 0);

        // Calculate conversion rates
        const platformConversionRate = totalPlatformInvitations > 0
            ? (acceptedPlatformInvitations / totalPlatformInvitations) * 100
            : 0;

        const stakeConversionRate = totalStakeInvitations > 0
            ? (acceptedStakeInvitations / totalStakeInvitations) * 100
            : 0;

        return NextResponse.json({
            success: true,
            stats: {
                referralCode: userData?.referralCode || null,
                referralCount: userData?.referralCount || 0,
                referralRewards: Number(userData?.referralRewards || 0),
                platform: {
                    total: totalPlatformInvitations,
                    accepted: acceptedPlatformInvitations,
                    pending: pendingPlatformInvitations,
                    expired: platformInvitations.filter(i => i.status === 'EXPIRED').length,
                    views: totalPlatformViews,
                    conversionRate: platformConversionRate
                },
                stake: {
                    total: totalStakeInvitations,
                    accepted: acceptedStakeInvitations,
                    pending: pendingStakeInvitations,
                    expired: stakeInvitations.filter(i => i.status === 'EXPIRED').length,
                    views: totalStakeViews,
                    conversionRate: stakeConversionRate
                },
                overall: {
                    totalInvitations: totalPlatformInvitations + totalStakeInvitations,
                    totalAccepted: acceptedPlatformInvitations + acceptedStakeInvitations,
                    totalPending: pendingPlatformInvitations + pendingStakeInvitations,
                    totalViews: totalPlatformViews + totalStakeViews
                }
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

