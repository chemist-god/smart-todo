import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, ValidationError } from "@/lib/error-handler";
import { z } from "zod";

const resendInvitationSchema = z.object({
    invitationId: z.string().min(1, "Invitation ID is required"),
    type: z.enum(['PLATFORM', 'STAKE']).default('STAKE')
});

// GET /api/invite/invitations - Get all user's invitations
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'PLATFORM' or 'STAKE'

        if (type === 'PLATFORM') {
            const invitations = await prisma.platformInvitation.findMany({
                where: { inviterId: user.id },
                include: {
                    acceptedUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({
                success: true,
                invitations: invitations.map(inv => ({
                    id: inv.id,
                    type: 'PLATFORM',
                    inviteCode: inv.inviteCode,
                    inviteeEmail: inv.inviteeEmail,
                    inviteePhone: inv.inviteePhone,
                    status: inv.status,
                    createdAt: inv.createdAt,
                    acceptedAt: inv.acceptedAt,
                    expiresAt: inv.expiresAt,
                    viewCount: inv.viewCount,
                    acceptedBy: inv.acceptedUser ? {
                        id: inv.acceptedUser.id,
                        name: inv.acceptedUser.name,
                        email: inv.acceptedUser.email,
                        image: inv.acceptedUser.image
                    } : null
                }))
            });
        } else {
            // Stake invitations
            const invitations = await prisma.stakeInvitation.findMany({
                where: { inviterId: user.id },
                include: {
                    stake: {
                        select: {
                            id: true,
                            title: true,
                            userStake: true,
                            deadline: true,
                            status: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({
                success: true,
                invitations: invitations.map(inv => ({
                    id: inv.id,
                    type: 'STAKE',
                    stakeId: inv.stakeId,
                    stakeTitle: inv.stake.title,
                    stakeAmount: Number(inv.stake.userStake),
                    inviteeEmail: inv.inviteeEmail,
                    securityCode: inv.securityCode,
                    message: inv.message,
                    status: inv.status,
                    createdAt: inv.createdAt,
                    acceptedAt: inv.acceptedAt,
                    expiresAt: inv.expiresAt,
                    viewCount: inv.viewCount
                }))
            });
        }

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// POST /api/invite/invitations/resend - Resend an invitation
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { invitationId, type } = resendInvitationSchema.parse(body);

        if (type === 'PLATFORM') {
            const invitation = await prisma.platformInvitation.findFirst({
                where: {
                    id: invitationId,
                    inviterId: user.id
                }
            });

            if (!invitation) {
                throw new ValidationError("Invitation not found");
            }

            if (invitation.status !== 'PENDING') {
                throw new ValidationError("Can only resend pending invitations");
            }

            // TODO: Send email notification
            // For now, just return success

            return NextResponse.json({
                success: true,
                message: "Invitation resent successfully"
            });
        } else {
            const invitation = await prisma.stakeInvitation.findFirst({
                where: {
                    id: invitationId,
                    inviterId: user.id
                },
                include: {
                    stake: {
                        select: {
                            title: true,
                            userStake: true
                        }
                    }
                }
            });

            if (!invitation) {
                throw new ValidationError("Invitation not found");
            }

            if (invitation.status !== 'PENDING') {
                throw new ValidationError("Can only resend pending invitations");
            }

            // TODO: Send email notification
            // For now, just return success

            return NextResponse.json({
                success: true,
                message: "Invitation resent successfully"
            });
        }

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// DELETE /api/invite/invitations/[id] - Cancel an invitation
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const invitationId = searchParams.get('id');
        const type = searchParams.get('type') || 'STAKE';

        if (!invitationId) {
            return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });
        }

        if (type === 'PLATFORM') {
            const invitation = await prisma.platformInvitation.findFirst({
                where: {
                    id: invitationId,
                    inviterId: user.id,
                    status: 'PENDING'
                }
            });

            if (!invitation) {
                throw new ValidationError("Invitation not found or cannot be cancelled");
            }

            await prisma.platformInvitation.update({
                where: { id: invitationId },
                data: { status: 'CANCELLED' }
            });
        } else {
            const invitation = await prisma.stakeInvitation.findFirst({
                where: {
                    id: invitationId,
                    inviterId: user.id,
                    status: 'PENDING'
                }
            });

            if (!invitation) {
                throw new ValidationError("Invitation not found or cannot be cancelled");
            }

            await prisma.stakeInvitation.update({
                where: { id: invitationId },
                data: { status: 'DECLINED' } // Use DECLINED for cancelled stake invitations
            });
        }

        return NextResponse.json({
            success: true,
            message: "Invitation cancelled successfully"
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

