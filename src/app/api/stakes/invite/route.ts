import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError, ValidationError } from "@/lib/error-handler";
import { z } from "zod";
import crypto from "crypto";

const inviteSchema = z.object({
    stakeId: z.string().min(1, "Stake ID is required"),
    email: z.string().email("Valid email is required"),
    message: z.string().optional()
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = inviteSchema.parse(body);

        // Get the stake
        const stake = await prisma.stake.findFirst({
            where: {
                id: validatedData.stakeId,
                userId: user.id,
                stakeType: 'SOCIAL_STAKE',
                status: 'ACTIVE'
            }
        });

        if (!stake) {
            throw new ValidationError("Stake not found or not eligible for invitations");
        }

        // Check if user is trying to invite themselves
        if (user.email === validatedData.email) {
            throw new ValidationError("Cannot invite yourself");
        }

        // Generate security code
        const securityCode = crypto.randomBytes(6).toString('hex').toUpperCase();

        // Create invitation record
        const invitation = await prisma.stakeInvitation.create({
            data: {
                stakeId: stake.id,
                inviterId: user.id,
                inviteeEmail: validatedData.email,
                message: validatedData.message || `Join my stake: "${stake.title}" for ₵${Number(stake.userStake).toFixed(2)}`,
                status: 'PENDING',
                securityCode,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        // TODO: Send actual email notification
        // For now, we'll just log it
        console.log(`Invitation sent to ${validatedData.email} for stake ${stake.id}`);

        return NextResponse.json({
            success: true,
            invitation: {
                id: invitation.id,
                email: invitation.inviteeEmail,
                message: invitation.message,
                expiresAt: invitation.expiresAt
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

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const stakeId = searchParams.get('stakeId');

        if (stakeId) {
            // Get invitations for a specific stake
            const invitations = await prisma.stakeInvitation.findMany({
                where: {
                    stakeId,
                    inviterId: user.id
                },
                include: {
                    stake: {
                        select: {
                            title: true,
                            userStake: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ invitations });
        } else {
            // Get all invitations for the user
            const invitations = await prisma.stakeInvitation.findMany({
                where: {
                    OR: [
                        { inviterId: user.id },
                        { inviteeEmail: user.email || '' }
                    ]
                },
                include: {
                    stake: {
                        select: {
                            title: true,
                            userStake: true,
                            deadline: true
                        }
                    },
                    inviter: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ invitations });
        }

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
