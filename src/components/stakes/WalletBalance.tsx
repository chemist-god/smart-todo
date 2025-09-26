"use client";

import { useState } from "react";
import { WalletIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, TrophyIcon, StarIcon, PlusIcon } from "@heroicons/react/24/outline";
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
    const { addToast } = useToast();

    const formatCurrency = (amount: number) => {
        return `Gh${amount.toFixed(2)}`;
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
        if (process.env.NODE_ENV === 'production') {
            addToast({ type: 'error', title: 'Error', message: 'Test deposits not available in production' });
            return;
        }

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
                addToast({ type: 'error', title: 'Error', message: error.error || 'Failed to add test funds' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'An error occurred while adding test funds' });
        } finally {
            setIsAddingFunds(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Main Balance Display */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-green-100 text-sm font-medium">Available Balance</p>
                        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                        <p className="text-green-100 text-sm mt-1">
                            Monthly Earnings: {formatCurrency(monthlyEarnings)}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                            <TrophyIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">#{rank}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StarIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">{currentStreak} day streak</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-green-100 hover:text-white text-sm font-medium flex items-center gap-1"
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                        <svg
                            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Test Deposit Button - Only show in development */}
                    {process.env.NODE_ENV !== 'production' && (
                        <button
                            onClick={handleAddTestFunds}
                            disabled={isAddingFunds}
                            className="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            <PlusIcon className="w-3 h-3 mr-1" />
                            {isAddingFunds ? 'Adding...' : 'Add Test Funds'}
                        </button>
                    )}
                </div>

                {process.env.NODE_ENV !== 'production' && (
                    <p className="text-green-100 text-xs mt-2">Development only - adds Gh100 for testing</p>
                )}
            </div>

            {/* Detailed Stats */}
            {showDetails && (
                <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Earned */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
                            <p className="text-sm text-gray-600">Total Earned</p>
                        </div>

                        {/* Total Lost */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalLost)}</p>
                            <p className="text-sm text-gray-600">Total Lost</p>
                        </div>

                        {/* Total Staked */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <WalletIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalStaked)}</p>
                            <p className="text-sm text-gray-600">Total Staked</p>
                        </div>

                        {/* Success Rate */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrophyIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{completionRate.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                    </div>

                    {/* Streak Information */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">{currentStreak}</p>
                                <p className="text-sm text-gray-600">Current Streak</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">{longestStreak}</p>
                                <p className="text-sm text-gray-600">Longest Streak</p>
                            </div>
                            <div className="text-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRankColor(rank)}`}>
                                    {getRankLabel(rank)}
                                </span>
                                <p className="text-sm text-gray-600 mt-1">Global Rank</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Net Profit/Loss</span>
                                <span className={`text-sm font-medium ${totalEarned - totalLost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalEarned - totalLost >= 0 ? '+' : ''}{formatCurrency(totalEarned - totalLost)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">ROI</span>
                                <span className={`text-sm font-medium ${totalStaked > 0 ? (totalEarned - totalLost) / totalStaked >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-600'}`}>
                                    {totalStaked > 0 ? `${(((totalEarned - totalLost) / totalStaked) * 100).toFixed(1)}%` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average Stake</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(totalStaked / Math.max(1, totalEarned + totalLost))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
