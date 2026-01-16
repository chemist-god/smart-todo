"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle, Mail, Smartphone, Copy, Sparkles } from "lucide-react";

function VerifyRequestContent() {
  const [token, setToken] = useState("");
  const [type, setType] = useState("EMAIL_VERIFICATION");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devToken, setDevToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for token and identifier in URL params or sessionStorage
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlType = searchParams.get('type');
    const urlIdentifier = searchParams.get('identifier');

    if (urlToken) {
      setToken(urlToken);
      setDevToken(urlToken);
    }

    if (urlType) {
      setType(urlType);
    }

    // Priority: URL params > sessionStorage
    if (urlIdentifier) {
      setIdentifier(urlIdentifier);
    } else {
      // Fallback to sessionStorage (set during registration)
      const storedIdentifier = sessionStorage.getItem('verification_identifier');
      const storedType = sessionStorage.getItem('verification_type');

      if (storedIdentifier) {
        setIdentifier(storedIdentifier);
      }

      if (storedType && !urlType) {
        setType(storedType);
      }
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, type }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear sessionStorage after successful verification
        sessionStorage.removeItem('verification_identifier');
        sessionStorage.removeItem('verification_type');

        setSuccess("Account verified successfully! Redirecting to sign in...");
        // User must now sign in manually after verification
        setTimeout(() => {
          router.push("/auth/signin");
        }, 1500);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Get identifier from URL params, sessionStorage, or state
    // Priority: URL params > sessionStorage > state
    let resendIdentifier = identifier ||
      searchParams.get('identifier') ||
      sessionStorage.getItem('verification_identifier');

    // If still no identifier, user must use the link from their email/phone
    if (!resendIdentifier) {
      setError("Unable to resend verification code. Please use the verification link from your email/phone message, or contact support.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: resendIdentifier,
          type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Verification token sent successfully! Please check your ${type === "EMAIL_VERIFICATION" ? "email" : "phone"}.`);
        // Update token if new one is provided (dev mode only)
        if (data.token) {
          setToken(data.token);
          setDevToken(data.token);
        }
      } else {
        setError(data.error || "Failed to resend verification");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = async () => {
    if (devToken) {
      await navigator.clipboard.writeText(devToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass shadow-strong border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Verify Your Account
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Enter the verification code sent to your {type === "EMAIL_VERIFICATION" ? "email" : "phone"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Verification Type Toggle */}
            <div className="flex rounded-lg bg-muted/50 p-1 border">
              <button
                type="button"
                onClick={() => setType("EMAIL_VERIFICATION")}
                disabled={isLoading}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200",
                  type === "EMAIL_VERIFICATION"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setType("PHONE_VERIFICATION")}
                disabled={isLoading}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200",
                  type === "PHONE_VERIFICATION"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Smartphone className="w-4 h-4" />
                Phone
              </button>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter verification code"
                  disabled={isLoading}
                  className="text-center text-lg tracking-wider bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                  disabled={isLoading || !token.trim()}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="w-full h-11 border-border/50 hover:bg-muted/50 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              </div>
            </form>

            {/* Development Token Display */}
            {process.env.NODE_ENV === 'development' && devToken && (
              <Card className="bg-warning/5 border-warning/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-warning flex items-center gap-2">
                    🚧 Development Mode
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Copy this token to verify your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                    <code className="block text-sm font-mono bg-background p-2 rounded border text-center select-all">
                      {devToken}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyToken}
                      className="w-full mt-2 h-8 text-xs border-warning/30 hover:bg-warning/10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {copied ? "Copied!" : "Copy to clipboard"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            <p className="text-center text-sm text-muted-foreground">
              Check your {type === "EMAIL_VERIFICATION" ? "email" : "phone"} for the verification code.
              {process.env.NODE_ENV === 'development' && (
                <>
                  <br />
                  <span className="text-xs opacity-75">
                    (Development: Token is shown above and logged to console)
                  </span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  );
}
