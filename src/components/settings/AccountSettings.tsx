"use client";

import { useState } from "react";
import { TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AccountSettings() {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { addToast } = useToast();

    const handleDeleteAccount = async () => {
        // TODO: Implement account deletion
        addToast({
            type: 'error',
            title: 'Account Deletion',
            message: 'This feature is not yet available. Please contact support.'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Account Management</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and data
                </p>
            </div>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <TrashIcon className="h-5 w-5" />
                        Delete Account
                    </CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!showDeleteConfirm ? (
                        <>
                            <Alert variant="destructive">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    This action cannot be undone. All your data, including todos, notes, stakes, and achievements will be permanently deleted.
                                </AlertDescription>
                            </Alert>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete My Account
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <AlertTitle>Are you absolutely sure?</AlertTitle>
                                <AlertDescription>
                                    This will permanently delete your account and all data. This action cannot be undone.
                                </AlertDescription>
                            </Alert>
                            <div className="flex gap-3">
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                >
                                    Yes, Delete Account
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

