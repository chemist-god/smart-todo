"use client";
import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";

interface InviteLandingClientProps {
  invite: any;
  error: string | null;
}

const InviteLandingClient: React.FC<InviteLandingClientProps> = ({ invite, error }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setErrMsg(null);
    try {
      if (!session) {
        // Not logged in: trigger sign-in, preserve invite code in callback URL
        await signIn(undefined, { callbackUrl: `/invite/${invite.securityCode}?autoAccept=1` });
        return;
      }
      // Logged in: call join endpoint
      const res = await fetch(`/api/stakes/invitation/${invite.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: invite.stakeAmount,
          isSupporter: true,
          securityCode: invite.securityCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrMsg(data.error || "Failed to accept invitation.");
      }
    } catch (e: any) {
      setErrMsg(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // Auto-accept after login (if callbackUrl param present)
    if (typeof window !== "undefined" && !success && !errMsg && session && new URLSearchParams(window.location.search).get("autoAccept") === "1") {
      handleAccept();
    }
    // eslint-disable-next-line
  }, [session]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-destructive/10 rounded-xl text-destructive text-center">
        <h2 className="text-xl font-bold mb-2">Invitation Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  if (!invite) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-muted rounded-xl text-muted-foreground text-center">
        <p>Invitation not found.</p>
      </div>
    );
  }
  const expired = invite.status === 'EXPIRED';
  const accepted = invite.status === 'ACCEPTED';
  return (
    <div className="max-w-lg mx-auto mt-12 p-8 rounded-2xl bg-card/50 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        {invite.inviterImage && (
          <img src={invite.inviterImage} alt="Inviter" className="w-14 h-14 rounded-full border-2 border-primary" />
        )}
        <div>
          <h2 className="text-2xl font-bold">{invite.inviterName} invited you!</h2>
          <div className="text-muted-foreground text-sm">to join <span className="font-semibold">{invite.stakeTitle}</span></div>
        </div>
      </div>
      <div className="mb-4">
        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mr-2">
          ₵{invite.stakeAmount}
        </span>
        <span className="inline-block bg-muted/30 text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
          Deadline: {new Date(invite.deadline).toLocaleDateString()}
        </span>
      </div>
      {invite.message && (
        <div className="mb-6 text-base italic text-muted-foreground">“{invite.message}”</div>
      )}
      {expired ? (
        <div className="bg-warning/10 text-warning p-4 rounded-lg text-center font-semibold">This invitation has expired.</div>
      ) : accepted ? (
        <div className="bg-success/10 text-success p-4 rounded-lg text-center font-semibold">This invitation has already been accepted.</div>
      ) : success ? (
        <div className="bg-success/10 text-success p-4 rounded-lg text-center font-semibold">You have successfully joined the stake!</div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            className="bg-primary text-white rounded-lg px-5 py-3 font-bold hover:bg-primary/90 transition disabled:opacity-60"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? "Joining..." : "Accept & Join Now"}
          </button>
          {errMsg && <div className="text-destructive text-sm text-center">{errMsg}</div>}
          <div className="text-xs text-muted-foreground text-center">You’ll be prompted to sign up or log in if you don’t have an account.</div>
        </div>
      )}
      <div className="mt-8 text-xs text-muted-foreground text-center">Invite code: <span className="font-mono">{invite.securityCode}</span></div>
    </div>
  );
};

export default InviteLandingClient;
