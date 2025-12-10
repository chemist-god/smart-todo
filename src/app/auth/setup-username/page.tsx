"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle, XCircle, Loader2, User, Sparkles, ArrowRight } from "lucide-react";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function SetupUsernameForm() {
  const [username, setUsername] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("idle");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounced availability check
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.trim().length < 3) {
      setAvailabilityStatus("idle");
      setValidationError("");
      return;
    }

    // Basic client-side validation
    if (value.length > 20) {
      setAvailabilityStatus("invalid");
      setValidationError("Username must be no more than 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9._/-]+$/.test(value)) {
      setAvailabilityStatus("invalid");
      setValidationError("Username can only contain letters, numbers, and characters: _ . / -");
      return;
    }

    if (/^[._/-]|[._/-]$/.test(value)) {
      setAvailabilityStatus("invalid");
      setValidationError("Username cannot start or end with special characters");
      return;
    }

    if (/[._/-]{2,}/.test(value)) {
      setAvailabilityStatus("invalid");
      setValidationError("Username cannot contain consecutive special characters");
      return;
    }

    setAvailabilityStatus("checking");
    setValidationError("");

    try {
      const response = await fetch("/api/username/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: value }),
      });

      const data = await response.json();

      if (data.available) {
        setAvailabilityStatus("available");
        setValidationError("");
      } else {
        setAvailabilityStatus("taken");
        setValidationError(data.message || "This username is not available");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityStatus("idle");
    }
  }, []);

  // Handle username input with debouncing
  useEffect(() => {
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    if (username.trim().length >= 3) {
      const timeout = setTimeout(() => {
        checkAvailability(username);
      }, 500); // 500ms debounce
      setCheckTimeout(timeout);
    } else {
      setAvailabilityStatus("idle");
      setValidationError("");
    }

    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [username, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (availabilityStatus !== "available") {
      setError("Please choose an available username");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/username/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Get redirect URL from query params or default to verify-request
        const redirectUrl = searchParams.get('redirect') || "/auth/verify-request";
        const identifier = searchParams.get('identifier');
        const type = searchParams.get('type');
        const accepted = searchParams.get('accepted');
        const inviterName = searchParams.get('inviterName');

        // Build redirect URL preserving all query params
        const url = new URL(redirectUrl, window.location.origin);
        if (identifier) url.searchParams.set('identifier', identifier);
        if (type) url.searchParams.set('type', type);
        if (accepted) url.searchParams.set('accepted', accepted);
        if (inviterName) url.searchParams.set('inviterName', inviterName);

        router.push(url.pathname + url.search);
      } else {
        setError(data.error || "Failed to set username. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Get redirect URL from query params or default to verify-request
    const redirectUrl = searchParams.get('redirect') || "/auth/verify-request";
    const identifier = searchParams.get('identifier');
    const type = searchParams.get('type');
    const accepted = searchParams.get('accepted');
    const inviterName = searchParams.get('inviterName');

    // Build redirect URL preserving all query params
    const url = new URL(redirectUrl, window.location.origin);
    if (identifier) url.searchParams.set('identifier', identifier);
    if (type) url.searchParams.set('type', type);
    if (accepted) url.searchParams.set('accepted', accepted);
    if (inviterName) url.searchParams.set('inviterName', inviterName);

    router.push(url.pathname + url.search);
  };

  const getStatusIcon = () => {
    switch (availabilityStatus) {
      case "checking":
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case "available":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "taken":
      case "invalid":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (availabilityStatus) {
      case "available":
        return "border-green-500 focus:border-green-500 focus:ring-green-500/20";
      case "taken":
      case "invalid":
        return "border-destructive focus:border-destructive focus:ring-destructive/20";
      default:
        return "";
    }
  };

  const isFormValid = availabilityStatus === "available" && username.trim().length >= 3;

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
                Choose Your Username
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Pick a unique username for your profile
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    disabled={isLoading}
                    className={cn(
                      "pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20",
                      getStatusColor()
                    )}
                    maxLength={20}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon()}
                  </div>
                </div>

                {/* Character Counter */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {validationError && (
                      <span className="text-destructive">{validationError}</span>
                    )}
                    {availabilityStatus === "available" && (
                      <span className="text-green-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Available
                      </span>
                    )}
                    {availabilityStatus === "checking" && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    username.length > 20 ? "text-destructive" : ""
                  )}>
                    {username.length}/20
                  </span>
                </div>

                {/* Validation Rules */}
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                  <p className="font-medium">Username rules:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>3-20 characters</li>
                    <li>Letters, numbers, and _ . / - allowed</li>
                    <li>Cannot start or end with special characters</li>
                    <li>No consecutive special characters</li>
                  </ul>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Setting username...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Skip Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SetupUsernamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="glass shadow-strong border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner className="w-8 h-8" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <SetupUsernameForm />
    </Suspense>
  );
}

