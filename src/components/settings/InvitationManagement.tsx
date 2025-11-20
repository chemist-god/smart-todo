"use client";

import { useState, useEffect } from "react";
import {
    EnvelopeIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowPathIcon,
    TrashIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface Invitation {
    id: string;
    type: 'PLATFORM' | 'STAKE';
    inviteCode?: string;
    securityCode?: string;
    stakeId?: string;
    stakeTitle?: string;
    stakeAmount?: number;
    inviteeEmail?: string;
    inviteePhone?: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
    createdAt: string;
    acceptedAt?: string;
    expiresAt: string;
    viewCount: number;
    acceptedBy?: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
}

export default function InvitationManagement() {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'platform' | 'stake'>('all');
    const [processing, setProcessing] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchInvitations();
    }, [activeTab]);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const type = activeTab === 'all' ? null : (activeTab === 'platform' ? 'PLATFORM' : 'STAKE');
            const url = type ? `/api/invite/invitations?type=${type}` : '/api/invite/invitations?type=PLATFORM';
            
            const [platformRes, stakeRes] = await Promise.all([
                fetch('/api/invite/invitations?type=PLATFORM'),
                fetch('/api/invite/invitations?type=STAKE')
            ]);

            const platformData = await platformRes.json();
            const stakeData = await stakeRes.json();

            const allInvitations: Invitation[] = [
                ...(platformData.invitations || []),
                ...(stakeData.invitations || [])
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setInvitations(allInvitations);
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load invitations'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async (invitationId: string, type: 'PLATFORM' | 'STAKE') => {
        try {
            setProcessing(invitationId);
            const response = await fetch('/api/invite/invitations/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId, type })
            });

            const data = await response.json();
            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: data.message || 'Invitation resent successfully'
                });
            } else {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: data.error || 'Failed to resend invitation'
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred'
            });
        } finally {
            setProcessing(null);
        }
    };

    const handleCancel = async (invitationId: string, type: 'PLATFORM' | 'STAKE') => {
        if (!confirm('Are you sure you want to cancel this invitation?')) {
            return;
        }

        try {
            setProcessing(invitationId);
            const response = await fetch(`/api/invite/invitations?id=${invitationId}&type=${type}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: 'Invitation cancelled successfully'
                });
                fetchInvitations();
            } else {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: data.error || 'Failed to cancel invitation'
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred'
            });
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { color: string; icon: any }> = {
            PENDING: { color: 'bg-warning/10 text-warning border-warning/20', icon: ClockIcon },
            ACCEPTED: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircleIcon },
            EXPIRED: { color: 'bg-muted text-muted-foreground border-border', icon: XCircleIcon },
            DECLINED: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircleIcon },
            CANCELLED: { color: 'bg-muted text-muted-foreground border-border', icon: XCircleIcon }
        };

        const variant = variants[status] || variants.PENDING;
        const Icon = variant.icon;

        return (
            <Badge variant="outline" className={cn("flex items-center gap-1", variant.color)}>
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const filteredInvitations = activeTab === 'all'
        ? invitations
        : invitations.filter(inv => inv.type === activeTab.toUpperCase());

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Invitation Management</h2>
                <p className="text-muted-foreground mt-1">
                    View and manage all your sent invitations
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All ({invitations.length})</TabsTrigger>
                    <TabsTrigger value="platform">
                        Platform ({invitations.filter(i => i.type === 'PLATFORM').length})
                    </TabsTrigger>
                    <TabsTrigger value="stake">
                        Stake ({invitations.filter(i => i.type === 'STAKE').length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filteredInvitations.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <EnvelopeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No invitations found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredInvitations.map((invitation) => (
                                <Card key={invitation.id} className="border-border/50">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        {invitation.type === 'PLATFORM' ? (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground">
                                                                    Platform Invitation
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    Code: <span className="font-mono">{invitation.inviteCode}</span>
                                                                </p>
                                                                {invitation.inviteeEmail && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        To: {invitation.inviteeEmail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <h4 className="font-semibold text-foreground">
                                                                    {invitation.stakeTitle || 'Stake Invitation'}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {invitation.inviteeEmail && `To: ${invitation.inviteeEmail}`}
                                                                    {invitation.stakeAmount && ` • Amount: ₵${invitation.stakeAmount}`}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1 font-mono">
                                                                    Code: {invitation.securityCode}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(invitation.status)}
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                                                    <span className="flex items-center gap-1">
                                                        <EyeIcon className="h-3 w-3" />
                                                        {invitation.viewCount} views
                                                    </span>
                                                    <span>
                                                        Created: {new Date(invitation.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {invitation.acceptedAt && (
                                                        <span className="text-success">
                                                            Accepted: {new Date(invitation.acceptedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {invitation.acceptedBy && (
                                                        <span className="text-success">
                                                            By: {invitation.acceptedBy.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {invitation.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleResend(invitation.id, invitation.type)}
                                                            disabled={processing === invitation.id}
                                                        >
                                                            {processing === invitation.id ? (
                                                                <LoadingSpinner size="sm" className="mr-2" />
                                                            ) : (
                                                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                            )}
                                                            Resend
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancel(invitation.id, invitation.type)}
                                                            disabled={processing === invitation.id}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <TrashIcon className="h-4 w-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

