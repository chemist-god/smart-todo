"use client";

import { useState } from "react";
import { WalletIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, TrophyIcon, StarIcon, PlusIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";

interface WalletBalanceProps {
    balance: number;
    totalEarned: number;
    totalLost: number;
    totalStaked: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    rank: number;
    monthlyEarnings: number;
    onBalanceUpdate?: () => void;
}

export default function WalletBalance({
    balance,
    totalEarned,
    totalLost,
    totalStaked,
    completionRate,
    currentStreak,
    longestStreak,
    rank,
    monthlyEarnings,
    onBalanceUpdate
}: WalletBalanceProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [isAddingFunds, setIsAddingFunds] = useState(false);
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const { addToast } = useToast();

    const formatCurrency = (amount: number) => {
        return `₵${amount.toFixed(2)}`;
    };

    const getRankColor = (rank: number) => {
        if (rank <= 10) return "text-yellow-600 bg-yellow-100";
        if (rank <= 50) return "text-gray-600 bg-gray-100";
        return "text-blue-600 bg-blue-100";
    };

    const getRankLabel = (rank: number) => {
        if (rank <= 10) return "Top 10";
        if (rank <= 50) return "Top 50";
        return "Rising";
    };

    const handleAddTestFunds = async () => {
        try {
            setIsAddingFunds(true);
            const response = await fetch('/api/wallet/test-deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 100 })
            });

            if (response.ok) {
                const data = await response.json();
                addToast({ type: 'success', title: 'Success', message: data.message });
                onBalanceUpdate?.();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || 'Failed to add demo funds' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'An error occurred while adding demo funds' });
        } finally {
            setIsAddingFunds(false);
        }
    };

    return (
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-soft overflow-hidden">
            {/* Aurora-Themed Main Balance Display */}
            <div className="relative overflow-hidden bg-gradient-to-br from-success via-success/90 to-success/80 p-6 sm:p-8 text-success-foreground">
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-success/5 backdrop-blur-3xl"></div>
                <div className="relative flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3">
                            <p className="text-success-foreground/80 text-sm sm:text-base font-medium">Available Balance</p>
                            <button 
                                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                className="p-1.5 rounded-full hover:bg-success-foreground/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-foreground/30"
                                aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
                            >
                                {isBalanceVisible ? (
                                    <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-foreground/70 hover:text-success-foreground transition-colors" />
                                ) : (
                                    <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-foreground/70 hover:text-success-foreground transition-colors" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center">
                            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight tabular-nums">
                                {isBalanceVisible ? formatCurrency(balance) : '•••••'}
                            </p>
                        </div>
                        <p className="text-success-foreground/70 text-sm font-medium">
                            Monthly Earnings: <span className="font-semibold">
                                {isBalanceVisible ? formatCurrency(monthlyEarnings) : '₵•••••'}
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-4 sm:gap-3 sm:text-right">
                        <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-success-foreground/10 backdrop-blur-sm">
                            <div className="p-1 rounded-lg bg-success-foreground/20">
                                <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-success-foreground/70">Rank</p>
                                <span className="text-sm sm:text-base font-bold tabular-nums">#{rank}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-success-foreground/10 backdrop-blur-sm">
                            <div className="p-1 rounded-lg bg-success-foreground/20">
                                <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-success-foreground/70">Streak</p>
                                <span className="text-sm sm:text-base font-bold tabular-nums">{currentStreak} days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mt-6">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="group relative inline-flex items-center gap-2 px-4 py-2 bg-success-foreground/10 hover:bg-success-foreground/20 text-success-foreground rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-success-foreground/20 touch-manipulation"
                    >
                        <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <div className="absolute inset-0 rounded-xl bg-success-foreground/5 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </button>

                    {/* Test Deposit Button - Controlled by environment variable */}
                    {(process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_TEST_FUNDS === 'true') && (
                        <button
                            onClick={handleAddTestFunds}
                            disabled={isAddingFunds}
                            className="group relative inline-flex items-center gap-2 px-4 py-2 bg-success-foreground/15 hover:bg-success-foreground/25 disabled:bg-success-foreground/5 text-success-foreground rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-success-foreground/20 disabled:opacity-50 touch-manipulation"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>{isAddingFunds ? 'Adding...' : (process.env.NODE_ENV === 'production' ? 'Add Demo Funds' : 'Add Test Funds')}</span>
                            <div className="absolute inset-0 rounded-xl bg-success-foreground/5 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        </button>
                    )}
                </div>

                {(process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_TEST_FUNDS === 'true') && (
                    <p className="text-success-foreground/60 text-xs mt-3 text-center sm:text-left">
                        {process.env.NODE_ENV === 'production' ? 'Demo mode - adds ₵100 for testing' : 'Development only - adds ₵100 for testing'}
                    </p>
                )}
            </div>

            {/* Aurora-Themed Detailed Stats */}
            {showDetails && (
                <div className="p-4 sm:p-6 border-t border-border/50 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Total Earned */}
                        <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                            <div className="p-2 rounded-xl bg-success/10 w-fit mx-auto mb-3 group-hover:bg-success/20 transition-colors duration-300">
                                <ArrowTrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                            </div>
                            <p className="text-lg sm:text-2xl font-bold text-success tabular-nums">
                                {isBalanceVisible ? formatCurrency(totalEarned) : '₵•••••'}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Earned</p>
                        </div>

                        {/* Total Lost */}
                        <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                            <div className="p-2 rounded-xl bg-destructive/10 w-fit mx-auto mb-3 group-hover:bg-destructive/20 transition-colors duration-300">
                                <ArrowTrendingDownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                            </div>
                            <p className="text-lg sm:text-2xl font-bold text-destructive tabular-nums">
                                {isBalanceVisible ? formatCurrency(totalLost) : '₵•••••'}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Lost</p>
                        </div>

                        {/* Total Staked */}
                        <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                            <div className="p-2 rounded-xl bg-info/10 w-fit mx-auto mb-3 group-hover:bg-info/20 transition-colors duration-300">
                                <WalletIcon className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
                            </div>
                            <p className="text-lg sm:text-2xl font-bold text-info tabular-nums">
                                {isBalanceVisible ? formatCurrency(totalStaked) : '₵•••••'}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Staked</p>
                        </div>

                        {/* Success Rate */}
                        <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                            <div className="p-2 rounded-xl bg-primary/10 w-fit mx-auto mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                                <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <p className="text-lg sm:text-2xl font-bold text-primary tabular-nums">{completionRate.toFixed(1)}%</p>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Success Rate</p>
                        </div>
                    </div>

                    {/* Aurora-Themed Streak Information */}
                    <div className="mt-6 pt-6 border-t border-border/30">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-center hover:shadow-soft transition-all duration-300">
                                <p className="text-xl sm:text-2xl font-bold text-warning tabular-nums">{currentStreak}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Current Streak</p>
                            </div>
                            <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-center hover:shadow-soft transition-all duration-300">
                                <p className="text-xl sm:text-2xl font-bold text-info tabular-nums">{longestStreak}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Longest Streak</p>
                            </div>
                            <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-center hover:shadow-soft transition-all duration-300">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium backdrop-blur-sm ${getRankColor(rank)}`}>
                                    {getRankLabel(rank)}
                                </span>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-2">Global Rank</p>
                            </div>
                        </div>
                    </div>

                    {/* Aurora-Themed Performance Summary */}
                    <div className="mt-6 pt-6 border-t border-border/30">
                        <h4 className="text-sm sm:text-base font-semibold text-foreground mb-4 tracking-tight">Performance Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30">
                                <span className="text-sm font-medium text-muted-foreground">Net Profit/Loss</span>
                                <span className={`text-sm font-bold tabular-nums ${isBalanceVisible ? (totalEarned - totalLost >= 0 ? 'text-success' : 'text-destructive') : 'text-muted'}`}>
                                    {isBalanceVisible ? `${totalEarned - totalLost >= 0 ? '+' : ''}${formatCurrency(totalEarned - totalLost)}` : '₵•••••'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30">
                                <span className="text-sm font-medium text-muted-foreground">ROI</span>
                                <span className={`text-sm font-bold tabular-nums ${isBalanceVisible ? (totalStaked > 0 ? ((totalEarned - totalLost) / totalStaked >= 0 ? 'text-success' : 'text-destructive') : 'text-muted-foreground') : 'text-muted'}`}>
                                    {isBalanceVisible ? (totalStaked > 0 ? `${(((totalEarned - totalLost) / totalStaked) * 100).toFixed(1)}%` : 'N/A') : '•••%'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30">
                                <span className="text-sm font-medium text-muted-foreground">Average Stake</span>
                                <span className="text-sm font-bold tabular-nums">
                                    {isBalanceVisible ? formatCurrency(totalStaked / Math.max(1, totalEarned + totalLost)) : '₵•••••'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
