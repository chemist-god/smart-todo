import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";
import { z } from "zod";
import crypto from "crypto";

const joinStakeSchema = z.object({
    amount: z.number().min(1, "Amount must be at least ₵1"),
    isSupporter: z.boolean().default(true)
});

const verifySecuritySchema = z.object({
    securityCode: z.string().min(6, "Security code must be at least 6 characters")
});

// GET /api/stakes/invitation/[id] - Get invitation details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const invitation = await prisma.stakeInvitation.findUnique({
            where: { id },
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

        if (!invitation) {
            throw new NotFoundError("Invitation not found");
        }

        // Check if invitation is expired
        const now = new Date();
        const isExpired = invitation.expiresAt < now;

        if (isExpired && invitation.status === 'PENDING') {
            // Auto-expire the invitation
            await prisma.stakeInvitation.update({
                where: { id },
                data: { status: 'EXPIRED' }
            });
            invitation.status = 'EXPIRED';
        }

        // Check if stake is still active
        if (invitation.stake.status !== 'ACTIVE') {
            throw new ValidationError("This stake is no longer active");
        }

        return NextResponse.json({
            invitation: {
                id: invitation.id,
                stakeId: invitation.stakeId,
                inviterName: invitation.inviter.name || 'Anonymous',
                inviterImage: invitation.inviter.image,
                stakeTitle: invitation.stake.title,
                stakeAmount: Number(invitation.stake.userStake),
                deadline: invitation.stake.deadline.toISOString(),
                message: invitation.message,
                status: invitation.status,
                expiresAt: invitation.expiresAt.toISOString(),
                createdAt: invitation.createdAt.toISOString(),
                securityCode: invitation.securityCode
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

// POST /api/stakes/invitation/[id]/verify - Verify security code
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = verifySecuritySchema.parse(body);

        const invitation = await prisma.stakeInvitation.findUnique({
            where: { id }
        });

        if (!invitation) {
            throw new NotFoundError("Invitation not found");
        }

        // Check if invitation is expired
        if (invitation.expiresAt < new Date()) {
            throw new ValidationError("Invitation has expired");
        }

        // Verify security code
        const isValidCode = crypto.timingSafeEqual(
            Buffer.from(invitation.securityCode),
            Buffer.from(validatedData.securityCode)
        );

        if (!isValidCode) {
            throw new ValidationError("Invalid security code");
        }

        return NextResponse.json({
            success: true,
            message: "Security code verified successfully"
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
