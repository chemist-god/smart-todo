"use client";

import { useState, useEffect } from "react";
import {
    UserPlusIcon,
    LinkIcon,
    ShareIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    SparklesIcon,
    ChartBarIcon,
    GiftIcon,
    EnvelopeIcon,
    QrCodeIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import QRCode from "qrcode";

interface InviteData {
    inviteCode: string;
    inviteLink: string;
    inviterName: string;
}

interface ReferralStats {
    referralCount: number;
    referralRewards: number;
    pendingInvitations: number;
    acceptedInvitations: number;
}

export default function InviteFriendsSettings() {
    const [inviteData, setInviteData] = useState<InviteData | null>(null);
    const [stats, setStats] = useState<ReferralStats>({
        referralCount: 0,
        referralRewards: 0,
        pendingInvitations: 0,
        acceptedInvitations: 0
    });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrCode, setQrCode] = useState<string>("");
    const { addToast } = useToast();

    useEffect(() => {
        fetchInviteData();
        fetchStats();
    }, []);

    const fetchInviteData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/invite/code');
            if (response.ok) {
                const data = await response.json();
                setInviteData({
                    inviteCode: data.inviteCode,
                    inviteLink: data.inviteLink,
                    inviterName: data.inviterName
                });
                generateQRCode(data.inviteLink);
            } else {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to load invite code'
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // TODO: Create API endpoint for referral stats
            // For now, using placeholder data
            const response = await fetch('/api/invite/code');
            if (response.ok) {
                // This would come from a dedicated stats endpoint
                setStats({
                    referralCount: 0,
                    referralRewards: 0,
                    pendingInvitations: 0,
                    acceptedInvitations: 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const generateQRCode = async (link: string) => {
        try {
            const qr = await QRCode.toDataURL(link, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff'
                }
            });
            setQrCode(qr);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            addToast({
                type: 'success',
                title: 'Copied!',
                message: 'Invite link copied to clipboard'
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to copy to clipboard'
            });
        }
    };

    const shareToSocial = async () => {
        const message = `Join me on Smart Todo! Use my invite code: ${inviteData?.inviteCode}\n\n${inviteData?.inviteLink}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Smart Todo',
                    text: message,
                    url: inviteData?.inviteLink
                });
            } catch (error) {
                // User cancelled
            }
        } else {
            copyToClipboard(message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-primary" />
                    Invite Friends
                </h2>
                <p className="text-muted-foreground mt-1">
                    Share Smart Todo with friends and earn rewards when they join!
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Referrals</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stats.referralCount}
                                </p>
                            </div>
                            <UserPlusIcon className="h-8 w-8 text-primary/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Accepted</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stats.acceptedInvitations}
                                </p>
                            </div>
                            <CheckIcon className="h-8 w-8 text-success/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stats.pendingInvitations}
                                </p>
                            </div>
                            <ChartBarIcon className="h-8 w-8 text-warning/60" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Rewards Earned</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    ₵{stats.referralRewards.toFixed(2)}
                                </p>
                            </div>
                            <GiftIcon className="h-8 w-8 text-info/60" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invite Code Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        Your Invite Code
                    </CardTitle>
                    <CardDescription>
                        Share this code or link with friends to invite them to Smart Todo
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Invite Code Display */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Invite Code</label>
                        <div className="flex gap-2">
                            <Input
                                value={inviteData?.inviteCode || ''}
                                readOnly
                                className="font-mono text-lg font-bold bg-background"
                            />
                            <Button
                                onClick={() => copyToClipboard(inviteData?.inviteCode || '')}
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "shrink-0",
                                    copied && "bg-success/10 border-success text-success"
                                )}
                            >
                                {copied ? (
                                    <CheckIcon className="h-5 w-5" />
                                ) : (
                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Invite Link Display */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Invite Link</label>
                        <div className="flex gap-2">
                            <Input
                                value={inviteData?.inviteLink || ''}
                                readOnly
                                className="font-mono text-sm bg-background"
                            />
                            <Button
                                onClick={() => copyToClipboard(inviteData?.inviteLink || '')}
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "shrink-0",
                                    copied && "bg-success/10 border-success text-success"
                                )}
                            >
                                {copied ? (
                                    <CheckIcon className="h-5 w-5" />
                                ) : (
                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* QR Code */}
                    {qrCode && (
                        <div className="flex flex-col items-center gap-3 p-4 bg-background rounded-lg border border-border/50">
                            <p className="text-sm font-medium text-foreground">QR Code</p>
                            <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                            <p className="text-xs text-muted-foreground text-center">
                                Scan to share instantly
                            </p>
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Button
                            onClick={shareToSocial}
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                            <ShareIcon className="h-4 w-4 mr-2" />
                            Share Everywhere
                        </Button>
                        <Button
                            onClick={() => copyToClipboard(inviteData?.inviteLink || '')}
                            variant="outline"
                            className="w-full"
                        >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                        Learn how the referral program works
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Share Your Code</h4>
                                <p className="text-sm text-muted-foreground">
                                    Copy your invite code or link and share it with friends via social media, email, or messaging apps.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Friends Join</h4>
                                <p className="text-sm text-muted-foreground">
                                    When your friends sign up using your invite code, they'll automatically be linked to your referral.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Earn Rewards</h4>
                                <p className="text-sm text-muted-foreground">
                                    You'll earn rewards for each friend who successfully joins and starts using Smart Todo!
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

