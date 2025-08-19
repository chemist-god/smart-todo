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
        className="rounded bg-black text-white px-4 py-2 hover:opacity-90"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span>
        Signed in as {session.user.name ?? session.user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="rounded border px-3 py-2 hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
}