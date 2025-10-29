"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { WalletIcon, PlusIcon, TrophyIcon, ChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import CreateStakeModal from "@/components/stakes/CreateStakeModal";
import StakeCard from "@/components/stakes/StakeCard";
import WalletBalance from "@/components/stakes/WalletBalance";
import StakeAnalytics from "@/components/stakes/StakeAnalytics";
import StakeNotifications from "@/components/stakes/StakeNotifications";
import StakeDiscoveryFeed from "@/components/stakes/StakeDiscoveryFeed";
import StakeLeaderboard from "@/components/stakes/StakeLeaderboard";
import SocialStakesFeed from "@/components/stakes/SocialStakesFeed";
import InvitationTest from "@/components/stakes/InvitationTest";
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
    const [activeTab, setActiveTab] = useState<'my-stakes' | 'social-stakes' | 'discover' | 'leaderboard' | 'rewards' | 'analytics' | 'notifications' | 'test'>('my-stakes');

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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
                {/* Aurora-Themed Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-6 sm:p-8 text-primary-foreground shadow-soft">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 backdrop-blur-3xl"></div>
                    <div className="relative flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="space-y-2 sm:space-y-3">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                                SmartStake Dashboard
                            </h1>
                            <p className="text-primary-foreground/80 text-sm sm:text-base font-medium">
                                Stake your money, complete your goals, earn rewards
                            </p>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-medium backdrop-blur-sm border border-primary-foreground/20 min-w-[140px] touch-manipulation"
                            >
                                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                                <span>Create Stake</span>
                                <div className="absolute inset-0 rounded-xl bg-primary-foreground/5 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                            </button>
                        </div>
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

                {/* Aurora-Themed Stats Overview */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {/* Active Stakes Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                    <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tabular-nums">
                                    {stats.activeStakes}
                                </p>
                                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full w-full transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Stakes Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors duration-300">
                                    <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Done</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-success tabular-nums">
                                    {stats.completedStakes}
                                </p>
                                <div className="h-1 bg-success/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-success rounded-full transition-all duration-500"
                                        style={{ width: `${stats.completedStakes > 0 ? Math.min((stats.completedStakes / (stats.activeStakes + stats.completedStakes)) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success Rate Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors duration-300">
                                    <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Success</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-warning tabular-nums">
                                    {stats.completionRate.toFixed(1)}%
                                </p>
                                <div className="h-1 bg-warning/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-warning rounded-full transition-all duration-500"
                                        style={{ width: `${stats.completionRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Earned Card */}
                    <div className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors duration-300">
                                    <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Earned</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-info tabular-nums">
                                    ₵{stats.totalEarned.toFixed(2)}
                                </p>
                                <div className="h-1 bg-info/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-info rounded-full w-3/4 transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aurora-Themed Tab Navigation */}
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-soft overflow-hidden">
                    <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5">
                        <nav className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
                            {[
                                { id: 'my-stakes', label: 'My Stakes' },
                                { id: 'social-stakes', label: 'Social' },
                                { id: 'discover', label: 'Discover' },
                                { id: 'leaderboard', label: 'Leaderboard' },
                                { id: 'rewards', label: 'Rewards' },
                                { id: 'analytics', label: 'Analytics' },
                                { id: 'notifications', label: 'Alerts' },
                                { id: 'test', label: 'Test' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-shrink-0 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 touch-manipulation min-w-[80px] ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/30'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Aurora-Themed Tab Content */}
                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto overscroll-contain scroll-smooth">
                        {activeTab === 'analytics' ? (
                            <StakeAnalytics userId={session?.user?.id || ''} />
                        ) : activeTab === 'notifications' ? (
                            <StakeNotifications userId={session?.user?.id || ''} />
                        ) : activeTab === 'discover' ? (
                            <StakeDiscoveryFeed userId={session?.user?.id || ''} />
                        ) : activeTab === 'social-stakes' ? (
                            <SocialStakesFeed userId={session?.user?.id || ''} />
                        ) : activeTab === 'leaderboard' ? (
                            <StakeLeaderboard userId={session?.user?.id || ''} />
                        ) : activeTab === 'test' ? (
                            <InvitationTest />
                        ) : filteredStakes.length === 0 ? (
                            // Aurora-Themed Empty State
                            <div className="text-center py-12 sm:py-16">
                                <div className="p-4 sm:p-6 rounded-2xl bg-muted/30 w-fit mx-auto mb-6">
                                    <WalletIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 tracking-tight">
                                    {activeTab === 'my-stakes' && 'No Active Stakes Yet'}
                                    {activeTab === 'rewards' && 'No Rewards Earned Yet'}
                                </h3>
                                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                                    {activeTab === 'my-stakes' && 'Create your first stake to start building accountability and earning rewards for completing your goals!'}
                                    {activeTab === 'rewards' && 'Complete some stakes to see your rewards and achievements here.'}
                                </p>
                                {activeTab === 'my-stakes' && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-medium touch-manipulation"
                                    >
                                        <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                        <span>Create Your First Stake</span>
                                        <div className="absolute inset-0 rounded-xl bg-primary-foreground/10 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        </div>
    );
}
