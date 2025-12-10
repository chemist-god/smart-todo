"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { UserIcon, EnvelopeIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function GeneralSettings() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(session?.user?.name || "");
    const [email, setEmail] = useState(session?.user?.email || "");
    const [username, setUsername] = useState("");
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("idle");
    const [validationError, setValidationError] = useState("");
    const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);
    const { addToast } = useToast();

    // Fetch current username
    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const response = await fetch("/api/user/profile");
                if (response.ok) {
                    const data = await response.json();
                    if (data.username) {
                        setCurrentUsername(data.username);
                        setUsername(data.username);
                    }
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };
        fetchUsername();
    }, []);

    // Debounced availability check for username
    const checkAvailability = useCallback(async (value: string) => {
        if (!value || value.trim().length < 3) {
            setAvailabilityStatus("idle");
            setValidationError("");
            return;
        }

        // If it's the same as current username, mark as available
        if (value.toLowerCase() === currentUsername?.toLowerCase()) {
            setAvailabilityStatus("available");
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
    }, [currentUsername]);

    // Handle username input with debouncing
    useEffect(() => {
        if (checkTimeout) {
            clearTimeout(checkTimeout);
        }

        if (username.trim().length >= 3 && username !== currentUsername) {
            const timeout = setTimeout(() => {
                checkAvailability(username);
            }, 500);
            setCheckTimeout(timeout);
        } else if (username === currentUsername) {
            setAvailabilityStatus("available");
            setValidationError("");
        } else {
            setAvailabilityStatus("idle");
            setValidationError("");
        }

        return () => {
            if (checkTimeout) {
                clearTimeout(checkTimeout);
            }
        };
    }, [username, currentUsername, checkAvailability]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // TODO: Implement API endpoint to update user profile (name, etc.)
            await new Promise(resolve => setTimeout(resolve, 1000));
            addToast({
                type: 'success',
                title: 'Saved!',
                message: 'Your profile has been updated'
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUsername = async () => {
        if (availabilityStatus !== "available" || username.trim().length < 3) {
            addToast({
                type: 'error',
                title: 'Invalid Username',
                message: 'Please choose a valid and available username'
            });
            return;
        }

        setUsernameLoading(true);
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
                setCurrentUsername(data.username);
                await update(); // Refresh session
                addToast({
                    type: 'success',
                    title: 'Success!',
                    message: data.message || 'Username updated successfully'
                });
            } else {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: data.error || 'Failed to update username'
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while updating username'
            });
        } finally {
            setUsernameLoading(false);
        }
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

    const isUsernameValid = availabilityStatus === "available" && username.trim().length >= 3;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">General Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account information and preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your personal information and contact details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <EnvelopeIcon className="h-4 w-4" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled
                            className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed. Contact support if you need to update it.
                        </p>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading && <LoadingSpinner size="sm" className="mr-2" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Username</CardTitle>
                    <CardDescription>
                        Choose a unique username for your profile. This can be used in URLs and mentions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Username
                        </Label>
                        <div className="relative">
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                disabled={usernameLoading}
                                maxLength={20}
                                className={cn(
                                    "pr-10",
                                    getStatusColor()
                                )}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {getStatusIcon()}
                            </div>
                        </div>
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
                        {currentUsername && (
                            <p className="text-xs text-muted-foreground">
                                Current username: <span className="font-medium">{currentUsername}</span>
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Username rules: 3-20 characters, letters, numbers, and _ . / - allowed. Cannot start or end with special characters.
                        </p>
                    </div>

                    <Button
                        onClick={handleSaveUsername}
                        disabled={usernameLoading || !isUsernameValid || username === currentUsername}
                        className="w-full sm:w-auto"
                    >
                        {usernameLoading && <LoadingSpinner size="sm" className="mr-2" />}
                        {currentUsername ? "Update Username" : "Set Username"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

