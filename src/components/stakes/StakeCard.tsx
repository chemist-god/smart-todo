"use client";

import { useState } from "react";
import {
    ClockIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import JoinStakeModal from "./JoinStakeModal";
import EnhancedSocialShare from "./EnhancedSocialShare";
import { OverdueStakeActions } from "./OverdueStakeActions";

interface Stake {
    id: string;
    title: string;
    description?: string;
    stakeType: string;
    status: string;
    totalAmount: number;
    userStake: number;
    friendStakes: number;
    deadline: string;
    createdAt: string;
    completedAt?: string;
    timeRemaining: number;
    isOverdue: boolean;
    progress: number;
    participantCount: number;
    totalParticipants: number;
    canJoin: boolean;
    isOwner: boolean;
}

interface StakeCardProps {
    stake: Stake;
    onUpdate: () => void;
}

export default function StakeCard({ stake, onUpdate }: StakeCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showCompleteForm, setShowCompleteForm] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [proof, setProof] = useState("");
    const { addToast } = useToast();

    const formatCurrency = (amount: number) => {
        return `Gh${amount.toFixed(2)}`;
    };

    const formatTimeRemaining = (milliseconds: number) => {
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-success/10 text-success border-success/20';
            case 'COMPLETED':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'FAILED':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'CANCELLED':
                return 'bg-muted/50 text-muted-foreground border-border/50';
            case 'EXPIRED':
                return 'bg-warning/10 text-warning border-warning/20';
            default:
                return 'bg-muted/50 text-muted-foreground border-border/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <ClockIcon className="w-4 h-4" />;
            case 'COMPLETED':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'FAILED':
                return <XCircleIcon className="w-4 h-4" />;
            case 'CANCELLED':
                return <XCircleIcon className="w-4 h-4" />;
            case 'EXPIRED':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    const handleCompleteStake = async () => {
        if (!proof.trim()) {
            addToast({ type: 'error', title: 'Error', message: 'Please provide proof of completion' });
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/stakes/${stake.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proof: proof.trim(),
                    completionTime: new Date().toISOString()
                }),
            });

            if (response.ok) {
                const data = await response.json();
                addToast({ type: 'success', title: 'Success', message: `Stake completed! You earned ${formatCurrency(data.reward.amount)}` });
                setShowCompleteForm(false);
                setProof("");
                onUpdate();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to complete stake" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while completing the stake" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinStake = () => {
        setShowJoinModal(true);
    };

    const handleCancelStake = async () => {
        if (!confirm("Are you sure you want to cancel this stake? You will receive a refund.")) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/stakes/${stake.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                addToast({ type: 'success', title: 'Success', message: "Stake cancelled successfully" });
                onUpdate();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to cancel stake" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while cancelling the stake" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-lg border border-border shadow-soft hover:shadow-medium transition-all duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2">{stake.title}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stake.status)}`}>
                            {getStatusIcon(stake.status)}
                            <span className="ml-1">{stake.status}</span>
                        </span>
                    </div>
                </div>

                {stake.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{stake.description}</p>
                )}
            </div>

            {/* Financial Info */}
            <div className="p-4 border-b border-border">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(stake.totalAmount)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Your Stake</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(stake.userStake)}</p>
                    </div>
                </div>

                {stake.stakeType === 'SOCIAL_STAKE' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Participants</span>
                            <div className="flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{stake.totalParticipants}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Time Info */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Deadline</span>
                    <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {new Date(stake.deadline).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {stake.status === 'ACTIVE' && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time Remaining</span>
                        <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                            <span className={`text-sm font-medium ${stake.isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                                {stake.isOverdue ? 'Overdue' : formatTimeRemaining(stake.timeRemaining)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {stake.status === 'ACTIVE' && (
                    <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${stake.isOverdue ? 'bg-destructive' : 'bg-primary'
                                    }`}
                                style={{ width: `${Math.min(100, Math.max(0, stake.progress))}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4">
                {/* Overdue Actions */}
                {stake.status === 'ACTIVE' && stake.isOverdue && stake.isOwner && (
                    <OverdueStakeActions
                        stake={{
                            id: stake.id,
                            title: stake.title,
                            stakeType: stake.stakeType,
                            totalAmount: stake.totalAmount,
                            userStake: stake.userStake,
                            deadline: stake.deadline,
                            isOverdue: stake.isOverdue,
                            timeRemaining: stake.timeRemaining,
                            isOwner: stake.isOwner,
                            extensionCount: 0, // Add this to your stake interface if needed
                            isExtended: false // Add this to your stake interface if needed
                        }}
                        onStakeUpdated={onUpdate}
                    />
                )}

                {/* Normal Active Actions */}
                {stake.status === 'ACTIVE' && !stake.isOverdue && stake.isOwner && (
                    <div className="space-y-2">
                        {!showCompleteForm ? (
                            <button
                                onClick={() => setShowCompleteForm(true)}
                                className="w-full bg-success hover:bg-success/90 text-success-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Complete Stake
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <textarea
                                    value={proof}
                                    onChange={(e) => setProof(e.target.value)}
                                    placeholder="Describe how you completed this task..."
                                    className="w-full p-2 border border-input bg-background rounded-lg text-sm resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCompleteStake}
                                        disabled={isLoading}
                                        className="flex-1 bg-success hover:bg-success/90 disabled:bg-muted text-success-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <LoadingSpinner size="sm" />}
                                        Submit Proof
                                    </button>
                                    <button
                                        onClick={() => setShowCompleteForm(false)}
                                        className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleCancelStake}
                            disabled={isLoading}
                            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel Stake
                        </button>
                    </div>
                )}

                {stake.status === 'ACTIVE' && !stake.isOwner && stake.canJoin && (
                    <button
                        onClick={handleJoinStake}
                        className="w-full bg-info hover:bg-info/90 text-info-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Join Stake
                    </button>
                )}

                {/* Universal Share Button for Social Stakes */}
                {stake.stakeType === 'SOCIAL_STAKE' && stake.status === 'ACTIVE' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <EnhancedSocialShare
                            stakeId={stake.id}
                            stakeTitle={stake.title}
                            stakeAmount={stake.totalAmount}
                            stakeDescription={stake.description}
                            deadline={stake.deadline}
                            category="personal" // Default category
                            difficulty="MEDIUM" // Default difficulty
                            onShareSent={() => {
                                addToast({
                                    type: 'success',
                                    title: 'Invitation Sent!',
                                    message: 'Your stake invitation has been shared successfully!'
                                });
                            }}
                        />
                    </div>
                )}

                {stake.status === 'COMPLETED' && (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-success mb-2">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-medium">Completed Successfully!</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Completed on {new Date(stake.completedAt!).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {stake.status === 'FAILED' && (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-destructive mb-2">
                            <XCircleIcon className="w-5 h-5" />
                            <span className="font-medium">Failed</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Penalty: {formatCurrency(stake.totalAmount)}
                        </p>
                    </div>
                )}
            </div>

            <JoinStakeModal
                stake={stake}
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onSuccess={() => {
                    onUpdate();
                    setShowJoinModal(false);
                }}
            />
        </div>
    );
}
