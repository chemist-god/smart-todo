"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { WalletIcon, PlusIcon, TrophyIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import CreateStakeModal from "@/components/stakes/CreateStakeModal";
import StakeCard from "@/components/stakes/StakeCard";
import WalletBalance from "@/components/stakes/WalletBalance";
import StakeAnalytics from "@/components/stakes/StakeAnalytics";
import StakeNotifications from "@/components/stakes/StakeNotifications";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

interface WalletData {
    balance: number;
    totalEarned: number;
    totalLost: number;
    totalStaked: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    rank: number;
    monthlyEarnings: number;
}

export default function StakesPage() {
    const { data: session } = useSession();
    const [stakes, setStakes] = useState<Stake[]>([]);
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'my-stakes' | 'social-stakes' | 'rewards' | 'analytics' | 'notifications'>('my-stakes');

    // Fetch stakes and wallet data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [stakesRes, walletRes] = await Promise.all([
                fetch('/api/stakes'),
                fetch('/api/wallet')
            ]);

            if (stakesRes.ok) {
                const stakesData = await stakesRes.json();
                setStakes(stakesData.stakes || []);
            }

            if (walletRes.ok) {
                const walletData = await walletRes.json();
                setWallet(walletData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const handleStakeCreated = () => {
        setShowCreateModal(false);
        fetchData(); // Refresh data
    };

    const handleStakeUpdated = () => {
        fetchData(); // Refresh data
    };

    const getFilteredStakes = () => {
        switch (activeTab) {
            case 'my-stakes':
                return stakes.filter(stake => stake.isOwner);
            case 'social-stakes':
                return stakes.filter(stake => stake.stakeType === 'SOCIAL_STAKE' && !stake.isOwner);
            case 'rewards':
                return stakes.filter(stake => stake.status === 'COMPLETED');
            default:
                return stakes;
        }
    };

    const getStats = () => {
        const myStakes = stakes.filter(stake => stake.isOwner);
        const activeStakes = myStakes.filter(stake => stake.status === 'ACTIVE');
        const completedStakes = myStakes.filter(stake => stake.status === 'COMPLETED');
        const totalEarned = completedStakes.reduce((sum, stake) => sum + (stake.totalAmount || 0), 0);

        return {
            activeStakes: activeStakes.length,
            completedStakes: completedStakes.length,
            totalEarned,
            completionRate: wallet?.completionRate || 0
        };
    };

    const stats = getStats();
    const filteredStakes = getFilteredStakes();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">SmartStake Dashboard</h1>
                        <p className="text-purple-100">Stake your money, complete your goals</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Stake
                    </button>
                </div>
            </div>

            {/* Wallet Balance */}
            {wallet && (
                <WalletBalance
                    balance={wallet.balance}
                    totalEarned={wallet.totalEarned}
                    totalLost={wallet.totalLost}
                    totalStaked={wallet.totalStaked}
                    completionRate={wallet.completionRate}
                    currentStreak={wallet.currentStreak}
                    longestStreak={wallet.longestStreak}
                    rank={wallet.rank}
                    monthlyEarnings={wallet.monthlyEarnings}
                    onBalanceUpdate={fetchData}
                />
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <WalletIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Active Stakes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeStakes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrophyIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completedStakes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <WalletIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Total Earned</p>
                            <p className="text-2xl font-bold text-gray-900">Gh{stats.totalEarned.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('my-stakes')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-stakes'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My Stakes
                        </button>
                        <button
                            onClick={() => setActiveTab('social-stakes')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'social-stakes'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Social Stakes
                        </button>
                        <button
                            onClick={() => setActiveTab('rewards')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'rewards'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Rewards
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Notifications
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'analytics' ? (
                        <StakeAnalytics userId={session?.user?.id || ''} />
                    ) : activeTab === 'notifications' ? (
                        <StakeNotifications userId={session?.user?.id || ''} />
                    ) : filteredStakes.length === 0 ? (
                        <div className="text-center py-12">
                            <WalletIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {activeTab === 'my-stakes' && 'No Active Stakes'}
                                {activeTab === 'social-stakes' && 'No Social Stakes Available'}
                                {activeTab === 'rewards' && 'No Completed Stakes'}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {activeTab === 'my-stakes' && 'Create your first stake to start earning rewards!'}
                                {activeTab === 'social-stakes' && 'No social stakes are currently available to join.'}
                                {activeTab === 'rewards' && 'Complete some stakes to see your rewards here.'}
                            </p>
                            {activeTab === 'my-stakes' && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Create Your First Stake
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStakes.map((stake) => (
                                <StakeCard
                                    key={stake.id}
                                    stake={stake}
                                    onUpdate={handleStakeUpdated}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Stake Modal */}
            {showCreateModal && (
                <CreateStakeModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleStakeCreated}
                />
            )}
        </div>
    );
}
