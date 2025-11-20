import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, NotFoundError, ValidationError } from "@/lib/error-handler";

// GET /api/stakes/[id]/share - Get shareable link with securityCode
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get the stake
        const stake = await prisma.stake.findFirst({
            where: {
                id,
                userId: user.id,
                stakeType: 'SOCIAL_STAKE',
                status: 'ACTIVE'
            }
        });

        if (!stake) {
            throw new NotFoundError("Stake not found or not eligible for sharing");
        }

        // Find existing public invitation (pre-generated)
        let invitation = await prisma.stakeInvitation.findFirst({
            where: {
                stakeId: id,
                inviterId: user.id,
                inviteeEmail: 'public@share.com',
                status: 'PENDING'
            },
            orderBy: { createdAt: 'desc' }
        });

        // If no public invitation exists, create one
        if (!invitation) {
            const crypto = await import('crypto');
            const securityCode = crypto.randomBytes(6).toString('hex').toUpperCase();
            
            invitation = await prisma.stakeInvitation.create({
                data: {
                    stakeId: id,
                    inviterId: user.id,
                    inviteeEmail: 'public@share.com',
                    message: `Join my stake: "${stake.title}" for ₵${Number(stake.userStake).toFixed(2)}`,
                    status: 'PENDING',
                    securityCode,
                    expiresAt: new Date(stake.deadline.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after deadline
                }
            });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const shareUrl = `${baseUrl}/invite/${invitation.securityCode}`;

        return NextResponse.json({
            success: true,
            shareUrl,
            securityCode: invitation.securityCode,
            inviteUrl: shareUrl
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
