import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/error-handler";
import { PUBLIC_SHARE_EMAIL } from "@/lib/constants";
import crypto from "crypto";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StakeInvitePage({ params }: PageProps) {
    const { id } = await params;

    try {
        // First, try to find by securityCode (the code might be a securityCode)
        let invitation = await prisma.stakeInvitation.findUnique({
            where: { securityCode: id },
            select: { securityCode: true }
        });

        // If not found by securityCode, try by invitation ID
        if (!invitation) {
            invitation = await prisma.stakeInvitation.findUnique({
                where: { id },
                select: { securityCode: true }
            });
        }

        // If not found by invitation ID, try to find by stakeId
        if (!invitation) {
            const stake = await prisma.stake.findUnique({
                where: { id },
                select: { id: true, userId: true, status: true, stakeType: true }
            });

            if (!stake || stake.status !== 'ACTIVE' || stake.stakeType !== 'SOCIAL_STAKE') {
                throw new NotFoundError("Stake not found or not eligible for invitations");
            }

            // Find existing pending invitation for this stake, or create a public one
            invitation = await prisma.stakeInvitation.findFirst({
                where: {
                    stakeId: stake.id,
                    status: 'PENDING',
                    expiresAt: { gt: new Date() }
                },
                orderBy: { createdAt: 'desc' },
                select: { securityCode: true }
            });

            // If no existing invitation, create a public one
            if (!invitation) {
                const securityCode = crypto.randomBytes(6).toString('hex').toUpperCase();
                const newInvitation = await prisma.stakeInvitation.create({
                    data: {
                        stakeId: stake.id,
                        inviterId: stake.userId,
                        inviteeEmail: PUBLIC_SHARE_EMAIL,
                        message: `Join this stake challenge!`,
                        status: 'PENDING',
                        securityCode,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                    },
                    select: { securityCode: true }
                });
                invitation = newInvitation;
            }
        }

        // Redirect to the unified invite route using securityCode
        redirect(`/invite/${invitation.securityCode}`);
    } catch (error) {
        // If error, redirect to home with error message
        redirect('/?error=invitation_not_found');
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;

    return {
        title: 'Join Stake - SmartStake',
        description: 'You\'ve been invited to join a stake! Support someone in achieving their goal.',
        openGraph: {
            title: 'Join Stake - SmartStake',
            description: 'You\'ve been invited to join a stake! Support someone in achieving their goal.',
            type: 'website',
        },
    };
}
