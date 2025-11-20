import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";
import crypto from "crypto";

// GET /api/invite/code - Get or generate user's invite code
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user already has a referral code
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { referralCode: true, name: true }
        });

        if (existingUser?.referralCode) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
            return NextResponse.json({
                success: true,
                inviteCode: existingUser.referralCode,
                inviteLink: `${baseUrl}/invite/${existingUser.referralCode}`,
                inviterName: existingUser.name || 'You'
            });
        }

        // Generate new referral code
        const username = existingUser?.name?.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) || 'USER';
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        const inviteCode = `${username}-${randomPart}`;

        // Ensure uniqueness (retry if collision)
        let finalCode = inviteCode;
        let attempts = 0;
        while (attempts < 10) {
            const existing = await prisma.platformInvitation.findUnique({
                where: { inviteCode: finalCode }
            });
            if (!existing) {
                break;
            }
            const newRandom = crypto.randomBytes(4).toString('hex').toUpperCase();
            finalCode = `${username}-${newRandom}`;
            attempts++;
        }

        // Update user with referral code
        await prisma.user.update({
            where: { id: user.id },
            data: { referralCode: finalCode }
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
        return NextResponse.json({
            success: true,
            inviteCode: finalCode,
            inviteLink: `${baseUrl}/invite/${finalCode}`,
            inviterName: existingUser?.name || 'You'
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// POST /api/invite/code - Create a new invitation (optional: with email/phone)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { inviteeEmail, inviteePhone, shareMethod } = body;

        // Get or create user's referral code
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { referralCode: true, name: true }
        });

        if (!userData?.referralCode) {
            // Generate referral code if doesn't exist
            const username = userData?.name?.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) || 'USER';
            const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
            const inviteCode = `${username}-${randomPart}`;
            
            await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: inviteCode }
            });
            userData.referralCode = inviteCode;
        }

        // Check if invitation already exists for this email/phone
        if (inviteeEmail || inviteePhone) {
            const existing = await prisma.platformInvitation.findFirst({
                where: {
                    inviterId: user.id,
                    OR: [
                        { inviteeEmail: inviteeEmail || undefined },
                        { inviteePhone: inviteePhone || undefined }
                    ],
                    status: 'PENDING'
                }
            });

            if (existing) {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
                return NextResponse.json({
                    success: true,
                    message: "Invitation already exists",
                    invitation: {
                        id: existing.id,
                        inviteCode: existing.inviteCode,
                        inviteLink: `${baseUrl}/invite/${existing.inviteCode}`,
                        expiresAt: existing.expiresAt
                    }
                });
            }
        }

        // Create new invitation
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const invitation = await prisma.platformInvitation.create({
            data: {
                inviterId: user.id,
                inviteCode: userData.referralCode,
                inviteeEmail: inviteeEmail || null,
                inviteePhone: inviteePhone || null,
                shareMethod: shareMethod || 'LINK',
                expiresAt,
                status: 'PENDING'
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
        return NextResponse.json({
            success: true,
            invitation: {
                id: invitation.id,
                inviteCode: invitation.inviteCode,
                inviteLink: `${baseUrl}/invite/${invitation.inviteCode}`,
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

