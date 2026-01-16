"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle, XCircle, Loader2, User, Sparkles, ArrowRight } from "lucide-react";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface UsernameSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UsernameSetupDialog({
  open,
  onOpenChange,
  onSuccess,
}: UsernameSetupDialogProps) {
  const [username, setUsername] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("idle");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session, update } = useSession();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setUsername("");
      setAvailabilityStatus("idle");
      setValidationError("");
      setError("");
    }
  }, [open]);

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
    // Clear any existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }

    if (username.trim().length >= 3) {
      const timeout = setTimeout(() => {
        checkAvailability(username);
      }, 500); // 500ms debounce
      checkTimeoutRef.current = timeout;
    } else {
      setAvailabilityStatus("idle");
      setValidationError("");
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
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
        // Update session to include username
        await update();
        // Close dialog and call success callback
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
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
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Choose Your Username
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Choose a username to make it easier for friends to find you
            </DialogDescription>
          </div>
        </DialogHeader>

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
              <span className={cn(username.length > 20 ? "text-destructive" : "")}>
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
      </DialogContent>
    </Dialog>
  );
}

