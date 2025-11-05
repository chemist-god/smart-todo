"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Checking auth…</p>;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="rounded bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 transition-colors"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground">
        Signed in as {session.user.name ?? session.user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="rounded border border-border px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}