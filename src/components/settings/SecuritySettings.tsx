"use client";

import { useState } from "react";
import { ShieldCheckIcon, KeyIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SecuritySettings() {
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // const { addToast } = useToast();

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Error', { description: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Error', { description: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement API endpoint to change password
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Success!', { description: 'Password changed successfully' });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error('Error', { description: 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Security Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account security and password
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyIcon className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <LoadingSpinner size="sm" className="mr-2" />}
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5" />
                        Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">2FA Status</p>
                            <p className="text-sm text-muted-foreground">
                                Two-factor authentication is currently disabled
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            Coming Soon
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

