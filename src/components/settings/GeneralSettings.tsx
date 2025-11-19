"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserIcon, EnvelopeIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GeneralSettings() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(session?.user?.name || "");
    const [email, setEmail] = useState(session?.user?.email || "");
    const { addToast } = useToast();

    const handleSave = async () => {
        setLoading(true);
        try {
            // TODO: Implement API endpoint to update user profile
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
        </div>
    );
}

