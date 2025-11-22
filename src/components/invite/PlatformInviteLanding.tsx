"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    UserPlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PlatformInvitation {
    id: string;
    inviteCode: string;
    inviterName: string;
    inviterImage?: string;
    inviterEmail?: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
    expiresAt: string;
    createdAt: string;
    viewCount: number;
    acceptanceCount?: number;
    userHasAccepted?: boolean;
}

interface PlatformInviteLandingProps {
    invitation: PlatformInvitation | null;
    error: string | null;
}

export default function PlatformInviteLanding({ invitation, error }: PlatformInviteLandingProps) {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const { addToast } = useToast();

    const handleAccept = useCallback(async () => {
        if (!invitation) return;

        // If not logged in, redirect to signup/login with invite code preserved
        if (!session) {
            const currentUrl = window.location.href;
            const signupUrl = `/auth/signup?inviteCode=${invitation.inviteCode}&redirect=${encodeURIComponent(currentUrl)}`;
            router.push(signupUrl);
            return;
        }

        // User is logged in, accept the invitation
        try {
            setAccepting(true);
            const response = await fetch(`/api/invite/${invitation.inviteCode}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Welcome!',
                    message: data.message || `You've joined via ${invitation.inviterName}'s invitation!`
                });

                // Redirect to welcome page after accepting
                router.push(`/welcome?accepted=true&inviterName=${encodeURIComponent(invitation.inviterName)}`);
            } else {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: data.error || 'Failed to accept invitation'
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while accepting the invitation'
            });
        } finally {
            setAccepting(false);
        }
    }, [invitation, session, router, addToast]);

    // Auto-accept if user is logged in and has autoAccept param
    useEffect(() => {
        if (typeof window !== "undefined" && session && invitation?.status === 'PENDING') {
            const params = new URLSearchParams(window.location.search);
            if (params.get("autoAccept") === "1" && !accepting) {
                handleAccept();
            }
        }
    }, [session, invitation, handleAccept, accepting]);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading invitation...</p>
                </div>
            </div>
        );
    }

    const isExpired = new Date(invitation.expiresAt) < new Date();
    const canAccept = invitation.status === 'PENDING' && !isExpired && !invitation.userHasAccepted;
    const userHasAccepted = invitation.userHasAccepted || false;
    const acceptanceCount = invitation.acceptanceCount || 0;
    const isLoggedIn = !!session;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">You're Invited!</h1>
                                <p className="text-purple-100 text-lg">
                                    Join Smart Todo and boost your productivity
                                </p>
                            </div>
                            <SparklesIcon className="h-12 w-12 text-yellow-300" />
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Inviter Info */}
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {invitation.inviterImage ? (
                                    <img
                                        src={invitation.inviterImage}
                                        alt={invitation.inviterName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    invitation.inviterName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {invitation.inviterName} invited you!
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Join thousands of users achieving their goals
                                </p>
                            </div>
                        </div>

                        {/* Platform Benefits */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                                What you'll get:
                            </h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Smart task management with AI-powered prioritization</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Stake money on your goals for accountability</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Track progress with analytics and insights</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Join a community of goal-achievers</span>
                                </li>
                            </ul>
                        </div>

                        {/* Acceptance Stats */}
                        {acceptanceCount > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-blue-800">
                                            {acceptanceCount} {acceptanceCount === 1 ? 'person has' : 'people have'} accepted this invitation
                                        </h4>
                                        <p className="text-blue-700 text-sm mt-1">
                                            Join {acceptanceCount === 1 ? 'them' : 'them'} and start achieving your goals!
                                        </p>
                                    </div>
                                    <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        )}

                        {/* Status Messages */}
                        {!canAccept && (
                            <div className="mb-6">
                                {isExpired ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-yellow-800">Invitation Expired</h4>
                                                <p className="text-yellow-700 text-sm mt-1">This invitation has expired and can no longer be used.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : userHasAccepted ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-green-800">You've Already Accepted!</h4>
                                                <p className="text-green-700 text-sm mt-1">
                                                    Great! You've already joined via {invitation.inviterName}'s invitation.
                                                </p>
                                                {isLoggedIn && (
                                                    <button
                                                        onClick={() => router.push('/dashboard')}
                                                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                                    >
                                                        Go to Dashboard
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
                                        <XCircleIcon className="h-5 w-5 text-gray-600 mr-3" />
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Cannot Accept</h4>
                                            <p className="text-gray-700 text-sm">This invitation is no longer available.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {canAccept && (
                            <div className="space-y-4">
                                {isLoggedIn ? (
                                    <button
                                        onClick={handleAccept}
                                        disabled={accepting}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:transform-none flex items-center justify-center shadow-lg"
                                    >
                                        {accepting ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlusIcon className="h-5 w-5 mr-2" />
                                                Accept Invitation
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleAccept}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
                                        >
                                            <UserPlusIcon className="h-5 w-5 mr-2" />
                                            Get Started - It's Free!
                                        </button>
                                        <p className="text-center text-sm text-gray-600">
                                            You'll be prompted to create an account (takes less than a minute)
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Invitation Details */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                                </div>
                                <span className="font-mono text-xs">{invitation.inviteCode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-gray-600 text-sm">
                        <span className="font-semibold text-purple-600">10,000+</span> users trust Smart Todo
                    </p>
                </div>
            </div>
        </div>
    );
}

