"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type AuthStatusProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const sizes: Record<NonNullable<AuthStatusProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base sm:text-lg",
};

export default function AuthStatus({ size = "md", label = "Sign In", className }: AuthStatusProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Checking auth…</p>;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm",
          "hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
          sizes[size],
          className
        )}
      >
        {label}
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
        className={cn(
          "inline-flex items-center justify-center rounded-xl border border-border text-foreground font-semibold shadow-sm",
          "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all",
          sizes[size],
          className
        )}
      >
        Sign out
      </button>
    </div>
  );
}