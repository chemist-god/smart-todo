"use client";

import { useState, useEffect } from "react";
import {
    HeartIcon,
    ShareIcon,
    EyeIcon,
    UserGroupIcon,
    ClockIcon,
    CurrencyDollarIcon,
    FireIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    HandThumbUpIcon,
    SparklesIcon,
    PlusIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StakeCard from "./StakeCard";
import JoinStakeModal from "./JoinStakeModal";

interface SocialStake {
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
    category: string;
    difficulty: string;
    popularity: number;
    viewCount: number;
    joinCount: number;
    shareCount: number;
    creator: {
        id: string;
        name: string;
        image?: string;
        rank: number;
        successRate: number;
        totalEarned: number;
    };
}

interface SocialStakesFeedProps {
    userId: string;
}

export default function SocialStakesFeed({ userId }: SocialStakesFeedProps) {
    const [stakes, setStakes] = useState<SocialStake[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('trending');
    const [category, setCategory] = useState('all');
    const [difficulty, setDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStake, setSelectedStake] = useState<SocialStake | null>(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchSocialStakes();
    }, [filter, category, difficulty, searchTerm]);

    const fetchSocialStakes = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                type: 'SOCIAL_STAKE',
                filter,
                category,
                difficulty,
                search: searchTerm,
                limit: '20'
            });

            const response = await fetch(`/api/stakes/discover?${params}`);
            if (response.ok) {
                const data = await response.json();
                setStakes(data.stakes || []);
            } else {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to fetch social stakes'
                });
            }
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'An error occurred while fetching social stakes'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStakeUpdate = () => {
        fetchSocialStakes();
    };

    // Interactive engagement handlers
    const handleViewStake = async (stakeId: string) => {
        try {
            // Increment view count
            await fetch(`/api/stakes/${stakeId}/view`, { method: 'POST' });
            addToast({
                type: 'success',
                title: 'Viewed!',
                message: 'Stake view recorded'
            });
            fetchSocialStakes(); // Refresh to update counts
        } catch (error) {
            console.error('Error viewing stake:', error);
        }
    };

    const handleLikeStake = async (stakeId: string) => {
        try {
            // Toggle like status
            await fetch(`/api/stakes/${stakeId}/like`, { method: 'POST' });
            addToast({
                type: 'success',
                title: 'Liked!',
                message: 'You liked this stake'
            });
            fetchSocialStakes(); // Refresh to update counts
        } catch (error) {
            console.error('Error liking stake:', error);
        }
    };

    const handleShareStake = async (stakeId: string) => {
        try {
            // Increment share count and open share modal
            await fetch(`/api/stakes/${stakeId}/share`, { method: 'POST' });

            // Copy share link to clipboard
            const shareUrl = `${window.location.origin}/stakes/invite/${stakeId}`;
            await navigator.clipboard.writeText(shareUrl);

            addToast({
                type: 'success',
                title: 'Shared!',
                message: 'Share link copied to clipboard'
            });
            fetchSocialStakes(); // Refresh to update counts
        } catch (error) {
            console.error('Error sharing stake:', error);
        }
    };

    const handleJoinStake = (stake: any) => {
        setSelectedStake(stake);
        setShowJoinModal(true);
    };

    const handleJoinSuccess = () => {
        setShowJoinModal(false);
        setSelectedStake(null);
        fetchSocialStakes();
        addToast({
            type: 'success',
            title: 'Joined Successfully!',
            message: 'You are now supporting this stake'
        });
    };

    const getFilterIcon = (filterType: string) => {
        switch (filterType) {
            case 'trending': return <ArrowTrendingUpIcon className="w-4 h-4" />;
            case 'recent': return <ClockIcon className="w-4 h-4" />;
            case 'ending': return <FireIcon className="w-4 h-4" />;
            case 'popular': return <StarIcon className="w-4 h-4" />;
            default: return <ArrowTrendingUpIcon className="w-4 h-4" />;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'text-green-600 bg-green-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'HARD': return 'text-orange-600 bg-orange-100';
            case 'EXTREME': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'fitness': return '💪';
            case 'work': return '💼';
            case 'learning': return '📚';
            case 'creative': return '🎨';
            case 'social': return '🤝';
            case 'personal': return '🌟';
            case 'financial': return '💰';
            default: return '🎯';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading social stakes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Ultra Compact Aurora Header */}
            <div className="flex items-center justify-between p-3 bg-info/5 backdrop-blur-sm rounded-lg border border-info/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-info/15 rounded-md">
                        <UserGroupIcon className="w-4 h-4 text-info" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-foreground">👥 Social Stakes</h4>
                        <p className="text-xs text-muted-foreground">Join challenges</p>
                    </div>
                </div>
                <div className="text-xs font-medium text-info bg-info/10 px-2 py-1 rounded-md">
                    {stakes.length}
                </div>
            </div>

            {/* Aurora-Themed Social Discovery */}
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-6 shadow-soft">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">👥 Find Friends to Support</h3>
                    <div className="text-sm text-muted-foreground font-medium">
                        <span className="tabular-nums">{stakes.length}</span> social stakes available
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Friends */}
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Search friends' stakes or creators..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="fitness">💪 Fitness</option>
                            <option value="work">💼 Work</option>
                            <option value="learning">📚 Learning</option>
                            <option value="creative">🎨 Creative</option>
                            <option value="social">🤝 Social</option>
                            <option value="personal">🌟 Personal</option>
                        </select>
                    </div>
                </div>

                {/* Aurora Filter Tabs */}
                <div className="mt-4 flex space-x-1 bg-info/5 p-1 rounded-lg">
                    {[
                        { id: 'trending', label: '🔥 Trending', icon: ArrowTrendingUpIcon },
                        { id: 'friends', label: '👥 Friends', icon: UserGroupIcon },
                        { id: 'ending', label: '⏰ Ending Soon', icon: ClockIcon },
                        { id: 'popular', label: '⭐ Popular', icon: StarIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === tab.id
                                ? 'bg-info text-info-foreground shadow-soft'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Aurora-Themed Social Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors duration-300">
                            <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-info" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Social</p>
                            <p className="text-lg sm:text-xl font-bold text-info tabular-nums">{stakes.filter(s => s.status === 'ACTIVE').length}</p>
                        </div>
                    </div>
                </div>

                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors duration-300">
                            <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Support Pool</p>
                            <p className="text-lg sm:text-xl font-bold text-success tabular-nums">
                                ₵{stakes.reduce((sum, stake) => sum + Number(stake.totalAmount), 0).toFixed(0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                            <HandThumbUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Community</p>
                            <p className="text-lg sm:text-xl font-bold text-primary tabular-nums">
                                {stakes.reduce((sum, stake) => sum + (stake.joinCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="group bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-destructive/10 rounded-xl group-hover:bg-destructive/20 transition-colors duration-300">
                            <FireIcon className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Trending</p>
                            <p className="text-lg sm:text-xl font-bold text-destructive tabular-nums">
                                {stakes.filter(s => (s.popularity || 0) > 10).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aurora Empty State */}
            {stakes.length === 0 ? (
                <div className="text-center py-8 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/30">
                    <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserGroupIcon className="w-6 h-6 text-info" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-2">👥 No Social Stakes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm || category !== 'all'
                            ? 'Try adjusting your search filters.'
                            : 'Invite friends to create stakes!'}
                    </p>
                    {!searchTerm && category === 'all' && (
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <button
                                onClick={() => window.location.href = '/stakes?tab=my-stakes'}
                                className="inline-flex items-center px-3 py-2 bg-info text-info-foreground rounded-lg hover:bg-info/90 transition-colors text-sm"
                            >
                                <SparklesIcon className="w-4 h-4 mr-1" />
                                Create Stake
                            </button>
                            <button
                                onClick={() => setFilter('trending')}
                                className="inline-flex items-center px-3 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm"
                            >
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                                View Trending
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stakes.map((stake) => (
                        <div key={stake.id} className="group">
                            {/* Aurora Social Stake Card */}
                            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-soft hover:shadow-medium hover:border-info/30 transition-all duration-300 overflow-hidden h-full flex flex-col group">
                                {/* Aurora Header */}
                                <div className="p-4 pb-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-info to-info/80 rounded-full flex items-center justify-center text-info-foreground font-semibold text-sm">
                                                {stake.creator.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-info transition-colors">{stake.creator.name}</h4>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <StarIcon className="w-3 h-3" />
                                                    <span>#{stake.creator.rank || 'New'}</span>
                                                    <span>•</span>
                                                    <span>{stake.creator.successRate || 0}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-lg">{getCategoryIcon(stake.category)}</div>
                                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(stake.difficulty)}`}>
                                                {stake.difficulty}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Aurora Content */}
                                <div className="px-4 pb-3 flex-1">
                                    <h3 className="font-semibold text-foreground mb-2 text-sm line-clamp-2 leading-tight group-hover:text-info transition-colors">{stake.title}</h3>

                                    {/* Aurora Stats */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-center">
                                            <div className="text-base font-bold text-success tabular-nums">₵{Number(stake.totalAmount).toFixed(0)}</div>
                                            <div className="text-xs text-muted-foreground">Pool</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-base font-bold text-info tabular-nums">{stake.participantCount || 0}</div>
                                            <div className="text-xs text-muted-foreground">Joined</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-base font-bold text-warning tabular-nums">{Math.ceil(stake.timeRemaining / (1000 * 60 * 60))}h</div>
                                            <div className="text-xs text-muted-foreground">Left</div>
                                        </div>
                                    </div>

                                    {/* Aurora Progress Bar */}
                                    <div className="mb-3">
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                            <div
                                                className="bg-gradient-to-r from-info to-primary h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.max(0, Math.min(100, stake.progress || 0))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Aurora Engagement Bar */}
                                <div className="px-4 py-3 bg-muted/30 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleViewStake(stake.id)}
                                                className="flex items-center gap-1 text-muted-foreground hover:text-info transition-colors group"
                                            >
                                                <EyeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium tabular-nums">{stake.viewCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleLikeStake(stake.id)}
                                                className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors group"
                                            >
                                                <HeartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium tabular-nums">{stake.joinCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleShareStake(stake.id)}
                                                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <ShareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium tabular-nums">{stake.shareCount || 0}</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 text-warning">
                                            <FireIcon className="w-4 h-4" />
                                            <span className="text-xs font-bold tabular-nums">{stake.popularity || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Aurora Action Button */}
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => handleJoinStake(stake)}
                                        className="w-full bg-info hover:bg-info/90 text-info-foreground py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-soft hover:shadow-medium"
                                    >
                                        Join & Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Join Stake Modal */}
            {selectedStake && (
                <JoinStakeModal
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    stake={selectedStake}
                    onSuccess={handleJoinSuccess}
                />
            )}
        </div>
    );
}
