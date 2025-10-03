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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">👥 Join & Support</h2>
                        <p className="text-pink-100">Support your friends and join their challenges</p>
                    </div>
                    <div className="flex items-center gap-2 text-pink-100">
                        <UserGroupIcon className="w-6 h-6" />
                        <span className="text-sm font-medium">{stakes.length} Social Stakes</span>
                    </div>
                </div>
            </div>

            {/* Social Discovery */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">👥 Find Friends to Support</h3>
                    <div className="text-sm text-gray-500">
                        {stakes.length} social stakes available
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

                {/* Social Filter Tabs */}
                <div className="mt-4 flex space-x-1 bg-pink-50 p-1 rounded-lg">
                    {[
                        { id: 'trending', label: '🔥 Trending', icon: ArrowTrendingUpIcon },
                        { id: 'friends', label: '👥 Friends', icon: UserGroupIcon },
                        { id: 'ending', label: '⏰ Ending Soon', icon: ClockIcon },
                        { id: 'popular', label: '⭐ Popular', icon: StarIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === tab.id
                                ? 'bg-white text-pink-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Social Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-pink-100 rounded-lg">
                            <UserGroupIcon className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Friends' Stakes</p>
                            <p className="text-2xl font-bold text-gray-900">{stakes.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Support Pool</p>
                            <p className="text-2xl font-bold text-gray-900">
                                Gh{stakes.reduce((sum, stake) => sum + Number(stake.totalAmount), 0).toFixed(0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <HandThumbUpIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Community</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stakes.reduce((sum, stake) => sum + (stake.joinCount || 0), 0)} supporters
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <FireIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Trending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stakes.filter(s => (s.popularity || 0) > 10).length} hot
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Stakes Grid */}
            {stakes.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserGroupIcon className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">👥 No Friends' Stakes Yet</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || category !== 'all'
                            ? 'Try adjusting your search to find friends\' stakes.'
                            : 'Invite friends to create social stakes or check back later!'}
                    </p>
                    {!searchTerm && category === 'all' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = '/stakes?tab=my-stakes'}
                                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors mr-3"
                            >
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Create Social Stake
                            </button>
                            <button
                                onClick={() => setFilter('trending')}
                                className="inline-flex items-center px-4 py-2 bg-white text-pink-600 border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors"
                            >
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                                View Trending
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stakes.map((stake) => (
                        <div key={stake.id} className="group">
                            {/* Sleek Social Stake Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 overflow-hidden h-full flex flex-col">
                                {/* Compact Header */}
                                <div className="p-4 pb-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {stake.creator.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm truncate">{stake.creator.name}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
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

                                {/* Compact Content */}
                                <div className="px-4 pb-3 flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 leading-tight">{stake.title}</h3>

                                    {/* Key Stats */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">Gh{Number(stake.totalAmount).toFixed(0)}</div>
                                            <div className="text-xs text-gray-500">Pool</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{stake.participantCount || 0}</div>
                                            <div className="text-xs text-gray-500">Joined</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{Math.ceil(stake.timeRemaining / (1000 * 60 * 60))}h</div>
                                            <div className="text-xs text-gray-500">Left</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.max(0, Math.min(100, stake.progress || 0))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Engagement Bar */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleViewStake(stake.id)}
                                                className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors group"
                                            >
                                                <EyeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">{stake.viewCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleLikeStake(stake.id)}
                                                className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors group"
                                            >
                                                <HeartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">{stake.joinCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleShareStake(stake.id)}
                                                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors group"
                                            >
                                                <ShareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">{stake.shareCount || 0}</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1 text-pink-600">
                                            <FireIcon className="w-4 h-4" />
                                            <span className="text-xs font-bold">{stake.popularity || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={() => handleJoinStake(stake)}
                                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
