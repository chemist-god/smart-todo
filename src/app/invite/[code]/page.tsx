import { Suspense } from "react";
import InviteLandingClient from "@/components/invite/InviteLandingClient";
import PlatformInviteLanding from "@/components/invite/PlatformInviteLanding";
import { ToastProvider } from "@/components/ui/Toast";

import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-handler";

// Server component: fetch invite details directly from database
export default async function InviteLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
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

      // Get acceptance count and check if current user has accepted (if session available)
      let acceptanceCount = 0;
      let userAcceptance = null;
      
      const acceptanceModel = (prisma as any).platformInvitationAcceptance;
      if (acceptanceModel) {
        try {
          // Try to count - if this fails, table doesn't exist yet
          acceptanceCount = await acceptanceModel.count({
            where: { invitationId: platformInvitation.id }
          });
          
          // Try to get current user's session to check if they've accepted
          try {
            const { auth } = await import('@/lib/auth');
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

      return (
        <ToastProvider>
          <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
            <PlatformInviteLanding
              invitation={{
                id: platformInvitation.id,
                inviteCode: platformInvitation.inviteCode,
                inviterName: platformInvitation.inviter.name || 'Someone',
                inviterImage: platformInvitation.inviter.image ? platformInvitation.inviter.image : undefined,
                inviterEmail: platformInvitation.inviter.email ? platformInvitation.inviter.email : undefined,
                status: platformInvitation.status,
                expiresAt: platformInvitation.expiresAt.toISOString(),
                createdAt: platformInvitation.createdAt.toISOString(),
                viewCount: platformInvitation.viewCount + 1,
                acceptanceCount: acceptanceCount,
                userHasAccepted: !!userAcceptance
              }}
              error={null}
            />
          </Suspense>
        </ToastProvider>
      );
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

    if (stakeInvitation) {
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
        return (
          <ToastProvider>
            <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
              <InviteLandingClient
                invite={null}
                error="This stake is no longer active"
              />
            </Suspense>
          </ToastProvider>
        );
      }

      // Track view
      await prisma.stakeInvitation.update({
        where: { securityCode: code },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date()
        }
      });

      return (
        <ToastProvider>
          <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
            <InviteLandingClient
              invite={{
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
              }}
              error={null}
            />
          </Suspense>
        </ToastProvider>
      );
    }

    // Not found
    return (
      <ToastProvider>
        <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
          <PlatformInviteLanding
            invitation={null}
            error="Invitation not found"
          />
        </Suspense>
      </ToastProvider>
    );

  } catch (error) {
    const { error: errorMessage } = handleApiError(error);
    return (
      <ToastProvider>
        <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
          <PlatformInviteLanding
            invitation={null}
            error={errorMessage || "An error occurred"}
          />
        </Suspense>
      </ToastProvider>
    );
  }
}
