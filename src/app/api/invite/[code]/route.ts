import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
                    viewCount: platformInvitation.viewCount + 1
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
