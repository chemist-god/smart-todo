"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Stake {
    id: string;
    title: string;
    description?: string;
    totalAmount: number;
    userStake: number;
    friendStakes: number;
    deadline: string;
    participantCount: number;
    totalParticipants: number;
}

interface JoinStakeModalProps {
    stake: Stake;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function JoinStakeModal({ stake, isOpen, onClose, onSuccess }: JoinStakeModalProps) {
    const [amount, setAmount] = useState(10);
    const [isSupporter, setIsSupporter] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (amount < 1) {
            addToast({ type: 'error', title: 'Error', message: 'Amount must be at least ₵1' });
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/stakes/${stake.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    isSupporter
                }),
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Success',
                    message: `Successfully joined stake with ₵${amount}!`
                });
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to join stake" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while joining the stake" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
            <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

                <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                    {/* Aurora-Themed Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
                        <div className="relative flex items-center justify-between p-4 sm:p-6">
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Join Stake</h2>
                                <p className="text-sm text-muted-foreground">Support this challenge</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="group relative p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 touch-manipulation"
                            >
                                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <div className="absolute inset-0 rounded-xl bg-destructive/10 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                            </button>
                        </div>
                    </div>

                    {/* Aurora-Themed Content */}
                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Stake Info */}
                        <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4">
                            <h3 className="font-semibold text-foreground mb-2">{stake.title}</h3>
                            {stake.description && (
                                <p className="text-sm text-muted-foreground mb-3">{stake.description}</p>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span className="text-muted-foreground">Participants:</span>
                                    <span className="font-medium text-primary tabular-nums">{stake.participantCount + 1}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                                    <span className="text-muted-foreground">Deadline:</span>
                                    <span className="font-medium text-warning">{new Date(stake.deadline).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Aurora Amount Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Stake Amount (₵)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            {/* Aurora Checkbox */}
                            <div className="flex items-center space-x-3 p-3 bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="isSupporter"
                                    checked={isSupporter}
                                    onChange={(e) => setIsSupporter(e.target.checked)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded transition-colors duration-200"
                                />
                                <label htmlFor="isSupporter" className="text-sm font-medium text-foreground cursor-pointer">
                                    I'm supporting this person
                                </label>
                            </div>

                            {/* Aurora Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="group relative flex-1 px-4 py-3 border border-border bg-card hover:bg-muted text-foreground rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                                >
                                    <span>Cancel</span>
                                    <div className="absolute inset-0 rounded-xl bg-muted/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 touch-manipulation flex items-center justify-center gap-2"
                                >
                                    {isLoading && <LoadingSpinner size="sm" />}
                                    <span>{isLoading ? 'Joining...' : 'Join Stake'}</span>
                                    <div className="absolute inset-0 rounded-xl bg-primary-foreground/10 scale-0 group-hover:scale-100 group-disabled:scale-0 transition-transform duration-200"></div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
