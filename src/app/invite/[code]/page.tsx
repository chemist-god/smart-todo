import { Suspense } from "react";
import InviteLandingClient from "@/components/invite/InviteLandingClient";
import PlatformInviteLanding from "@/components/invite/PlatformInviteLanding";

// Server component: fetch invite details and render appropriate client component
export default async function InviteLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/invite/${code}`, {
      cache: 'no-store' // Always fetch fresh data
    });
    const data = await res.json();
    
    // Determine invitation type and render appropriate component
    if (data.type === 'PLATFORM') {
      return (
        <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
          <PlatformInviteLanding 
            invitation={data.invitation || null} 
            error={data.error || null} 
          />
        </Suspense>
      );
    } else {
      // Stake invitation - use existing component
      return (
        <Suspense fallback={<div className="p-8 text-center">Loading invitation...</div>}>
          <InviteLandingClient 
            invite={data.invitation || null} 
            error={data.error || null} 
          />
        </Suspense>
      );
    }
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Invitation</h1>
          <p className="text-gray-600">Please check the invitation link and try again.</p>
        </div>
      </div>
    );
  }
}
