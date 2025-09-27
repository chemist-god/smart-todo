"use client";

import { useState } from "react";
import { UserPlusIcon, ShareIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface SocialStakeInviteProps {
    stakeId: string;
    stakeTitle: string;
    stakeAmount: number;
    onInviteSent: () => void;
}

export default function SocialStakeInvite({
    stakeId,
    stakeTitle,
    stakeAmount,
    onInviteSent
}: SocialStakeInviteProps) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const inviteLink = `${window.location.origin}/stakes/invite/${stakeId}`;

    const handleEmailInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            addToast({ type: 'error', title: 'Error', message: 'Please enter an email address' });
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('/api/stakes/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stakeId,
                    email: email.trim(),
                    message: message.trim() || `Join my stake: "${stakeTitle}" for Gh${stakeAmount}`
                }),
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Invitation Sent',
                    message: `Invitation sent to ${email}`
                });
                setEmail("");
                setMessage("");
                setShowInviteModal(false);
                onInviteSent();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to send invitation" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while sending invitation" });
        } finally {
            setIsLoading(false);
        }
    };

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            addToast({ type: 'success', title: 'Copied', message: 'Invite link copied to clipboard' });
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to copy link' });
        }
    };

    const shareToSocial = async () => {
        const shareText = `Join my stake: "${stakeTitle}" for Gh${stakeAmount}! Can you help me stay accountable? ${inviteLink}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join My Stake: ${stakeTitle}`,
                    text: shareText,
                    url: inviteLink
                });
            } catch (error) {
                // User cancelled sharing
            }
        } else {
            // Fallback to copying to clipboard
            await navigator.clipboard.writeText(shareText);
            addToast({ type: 'success', title: 'Copied', message: 'Share text copied to clipboard' });
        }
    };

    return (
        <>
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Invite Friends</h4>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Email Invite
                    </button>

                    <button
                        onClick={copyInviteLink}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Copy Link
                    </button>

                    <button
                        onClick={shareToSocial}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Share
                    </button>
                </div>

                {/* Invite Link Display */}
                <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-600 mb-1">Invite Link:</p>
                    <p className="text-sm text-gray-800 font-mono break-all">{inviteLink}</p>
                </div>
            </div>

            {/* Email Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Email Invitation</h3>

                        <form onSubmit={handleEmailInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="friend@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Personal Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Hey! I need your support to stay accountable on this goal..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
