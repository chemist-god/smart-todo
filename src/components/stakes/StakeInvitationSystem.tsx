"use client";

import { useState, useEffect } from "react";
import {
    UserPlusIcon,
    EyeIcon,
    ShieldCheckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface StakeInvitation {
    id: string;
    stakeId: string;
    inviterName: string;
    inviterImage?: string;
    stakeTitle: string;
    stakeAmount: number;
    deadline: string;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    expiresAt: string;
    createdAt: string;
    securityCode: string;
}

interface StakeInvitationSystemProps {
    invitationId: string;
}

export default function StakeInvitationSystem({ invitationId }: StakeInvitationSystemProps) {
    const [invitation, setInvitation] = useState<StakeInvitation | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joinAmount, setJoinAmount] = useState(10);
    const [isSupporter, setIsSupporter] = useState(true);
    const [securityVerified, setSecurityVerified] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchInvitation();
    }, [invitationId]);

    const fetchInvitation = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/stakes/invitation/${invitationId}`);
            if (response.ok) {
                const data = await response.json();
                setInvitation(data.invitation);
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || 'Invitation not found' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to load invitation' });
        } finally {
            setLoading(false);
        }
    };

    const verifySecurityCode = async (code: string) => {
        try {
            const response = await fetch(`/api/stakes/invitation/${invitationId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securityCode: code })
            });

            if (response.ok) {
                setSecurityVerified(true);
                addToast({ type: 'success', title: 'Verified', message: 'Security code verified successfully' });
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || 'Invalid security code' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to verify security code' });
        }
    };

    const handleJoinStake = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!securityVerified) {
            addToast({ type: 'error', title: 'Error', message: 'Please verify security code first' });
            return;
        }

        if (joinAmount < 1) {
            addToast({ type: 'error', title: 'Error', message: 'Amount must be at least ₵1' });
            return;
        }

        try {
            setJoining(true);
            const response = await fetch(`/api/stakes/invitation/${invitationId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: joinAmount,
                    isSupporter: isSupporter
                })
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Joined Successfully!',
                    message: `You've joined ${invitation?.inviterName}'s stake with ₵${joinAmount}`
                });
                // Redirect to stakes page after successful join
                setTimeout(() => {
                    window.location.href = '/stakes?joined=true';
                }, 2000);
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || 'Failed to join stake' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'An error occurred while joining' });
        } finally {
            setJoining(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'ACCEPTED': return 'text-green-600 bg-green-100';
            case 'DECLINED': return 'text-red-600 bg-red-100';
            case 'EXPIRED': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <ClockIcon className="h-4 w-4" />;
            case 'ACCEPTED': return <CheckCircleIcon className="h-4 w-4" />;
            case 'DECLINED': return <XCircleIcon className="h-4 w-4" />;
            case 'EXPIRED': return <ExclamationTriangleIcon className="h-4 w-4" />;
            default: return <ClockIcon className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
                    <p className="text-gray-600">This invitation may have expired or been removed.</p>
                </div>
            </div>
        );
    }

    const isExpired = new Date(invitation.expiresAt) < new Date();
    const canJoin = invitation.status === 'PENDING' && !isExpired;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Stake Invitation</h1>
                                <p className="text-purple-100">You've been invited to join a stake!</p>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invitation.status)}`}>
                                    {getStatusIcon(invitation.status)}
                                    <span className="ml-2">{invitation.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Inviter Info */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-semibold text-lg">
                                    {invitation.inviterName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{invitation.inviterName}</h2>
                                <p className="text-gray-600">invited you to join their stake</p>
                            </div>
                        </div>

                        {/* Stake Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{invitation.stakeTitle}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Stake Amount:</span>
                                    <span className="ml-2 font-semibold text-green-600">₵{invitation.stakeAmount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Deadline:</span>
                                    <span className="ml-2 font-semibold">{new Date(invitation.deadline).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {invitation.message && (
                                <div className="mt-4 p-3 bg-white rounded border-l-4 border-purple-500">
                                    <p className="text-gray-800 italic">"{invitation.message}"</p>
                                </div>
                            )}
                        </div>

                        {/* Security Verification */}
                        {!securityVerified && canJoin && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center mb-3">
                                    <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                    <h4 className="font-semibold text-yellow-800">Security Verification Required</h4>
                                </div>
                                <p className="text-yellow-700 text-sm mb-3">
                                    To join this stake, please verify the security code sent to your email.
                                </p>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Enter security code"
                                        className="flex-1 px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                verifySecurityCode(e.currentTarget.value);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const code = (document.querySelector('input[placeholder="Enter security code"]') as HTMLInputElement)?.value;
                                            if (code) verifySecurityCode(code);
                                        }}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Join Form */}
                        {canJoin && securityVerified && (
                            <form onSubmit={handleJoinStake} className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <UserPlusIcon className="h-5 w-5 mr-2 text-purple-600" />
                                    Join This Stake
                                </h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Stake Amount (₵)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={joinAmount}
                                        onChange={(e) => setJoinAmount(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isSupporter"
                                        checked={isSupporter}
                                        onChange={(e) => setIsSupporter(e.target.checked)}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isSupporter" className="ml-2 text-sm text-gray-700">
                                        I'm supporting {invitation.inviterName} to succeed
                                    </label>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h5 className="font-semibold text-blue-800 mb-2">What happens next?</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Your stake will be added to the total pool</li>
                                        <li>• If {invitation.inviterName} succeeds, you'll get your money back plus rewards</li>
                                        <li>• If they fail, you'll get your money back (no penalty for supporters)</li>
                                        <li>• You'll receive updates on their progress</li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    disabled={joining}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                                >
                                    {joining && <LoadingSpinner size="sm" className="mr-2" />}
                                    Join Stake (₵{joinAmount})
                                </button>
                            </form>
                        )}

                        {/* Status Messages */}
                        {!canJoin && (
                            <div className="text-center py-8">
                                {isExpired ? (
                                    <div>
                                        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Expired</h3>
                                        <p className="text-gray-600">This invitation has expired and can no longer be used.</p>
                                    </div>
                                ) : invitation.status === 'ACCEPTED' ? (
                                    <div>
                                        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Joined</h3>
                                        <p className="text-gray-600">You've already joined this stake.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <XCircleIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Join</h3>
                                        <p className="text-gray-600">This invitation is no longer available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
