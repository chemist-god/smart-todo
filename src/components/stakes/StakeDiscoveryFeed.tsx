"use client";

import { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    HeartIcon,
    UserGroupIcon,
    ClockIcon,
    CurrencyDollarIcon,
    FireIcon,
    StarIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import JoinStakeModal from "./JoinStakeModal";

interface DiscoverStake {
    id: string;
    title: string;
    description?: string;
    stakeType: string;
    totalAmount: number;
    userStake: number;
    friendStakes: number;
    deadline: string;
    createdAt: string;
    timeRemaining: number;
    isOverdue: boolean;
    progress: number;
    participantCount: number;
    totalParticipants: number;
    canJoin: boolean;
    isOwner: boolean;
    creator: {
        id: string;
        name: string;
        image?: string;
    };
    category: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
    tags: string[];
    popularity: number;
    successRate: number;
}

interface StakeDiscoveryFeedProps {
    userId: string;
}

export default function StakeDiscoveryFeed({ userId }: StakeDiscoveryFeedProps) {
    const [stakes, setStakes] = useState<DiscoverStake[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [sortBy, setSortBy] = useState("popularity");
    const [selectedStake, setSelectedStake] = useState<DiscoverStake | null>(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const { addToast } = useToast();

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "fitness", label: "Fitness & Health" },
        { value: "work", label: "Work & Career" },
        { value: "learning", label: "Learning & Skills" },
        { value: "personal", label: "Personal Development" },
        { value: "creative", label: "Creative Projects" },
        { value: "social", label: "Social & Relationships" },
        { value: "financial", label: "Financial Goals" }
    ];

    const difficulties = [
        { value: "all", label: "All Levels" },
        { value: "EASY", label: "Easy", color: "text-green-600" },
        { value: "MEDIUM", label: "Medium", color: "text-yellow-600" },
        { value: "HARD", label: "Hard", color: "text-orange-600" },
        { value: "EXTREME", label: "Extreme", color: "text-red-600" }
    ];

    const sortOptions = [
        { value: "popularity", label: "Most Popular" },
        { value: "deadline", label: "Deadline Soon" },
        { value: "amount", label: "Highest Stakes" },
        { value: "participants", label: "Most Participants" },
        { value: "success", label: "Highest Success Rate" }
    ];

    useEffect(() => {
        fetchStakes();
    }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

    const fetchStakes = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search: searchTerm,
                category: selectedCategory,
                difficulty: selectedDifficulty,
                sortBy
            });

            const response = await fetch(`/api/stakes/discover?${params}`);
            if (response.ok) {
                const data = await response.json();
                setStakes(data.stakes || []);
            }
        } catch (error) {
            console.error('Error fetching stakes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinStake = (stake: DiscoverStake) => {
        setSelectedStake(stake);
        setShowJoinModal(true);
    };

    const handleJoinSuccess = () => {
        setShowJoinModal(false);
        setSelectedStake(null);
        fetchStakes(); // Refresh the feed
        addToast({
            type: 'success',
            title: 'Joined Stake!',
            message: 'You successfully joined the stake. Good luck!'
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HARD': return 'bg-orange-100 text-orange-800';
            case 'EXTREME': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTimeRemaining = (timeRemaining: number) => {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return 'Less than 1h';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">🔍 Discover & Explore</h2>
                        <p className="text-emerald-100">Browse all stake types across the platform</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                        <MagnifyingGlassIcon className="w-6 h-6" />
                        <span className="text-sm font-medium">{stakes.length} Stakes Available</span>
                    </div>
                </div>
            </div>

            {/* Advanced Discovery Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">🔍 Advanced Discovery</h3>
                    <div className="text-sm text-gray-500">
                        {stakes.length} stakes across all categories
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search all stakes, creators, or descriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    {/* Difficulty Filter */}
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {difficulties.map(difficulty => (
                            <option key={difficulty.value} value={difficulty.value}>
                                {difficulty.label}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Discovery Results */}
            {stakes.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MagnifyingGlassIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">🔍 No Stakes Found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                            ? 'Try adjusting your discovery filters to find more stakes'
                            : 'No stakes available across the platform at the moment'
                        }
                    </p>
                    {!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = '/stakes?tab=my-stakes'}
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mr-3"
                            >
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Create First Stake
                            </button>
                            <button
                                onClick={() => setSortBy('newest')}
                                className="inline-flex items-center px-4 py-2 bg-white text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                                Browse All
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stakes.map((stake) => (
                        <div key={stake.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-purple-600 font-semibold text-sm">
                                                {stake.creator.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{stake.creator.name}</h3>
                                            <p className="text-sm text-gray-500">{stake.category}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(stake.difficulty)}`}>
                                        {stake.difficulty}
                                    </span>
                                </div>

                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{stake.title}</h4>
                                {stake.description && (
                                    <p className="text-gray-600 text-sm line-clamp-2">{stake.description}</p>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">Gh{stake.totalAmount.toFixed(0)}</div>
                                        <div className="text-xs text-gray-500">Total Stake</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{stake.participantCount}</div>
                                        <div className="text-xs text-gray-500">Supporters</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{stake.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${stake.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Time Remaining */}
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        <span>{getTimeRemaining(stake.timeRemaining)} left</span>
                                    </div>
                                    <div className="flex items-center">
                                        <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                                        <span>{stake.successRate}% success</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                {stake.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {stake.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Join Button */}
                                {stake.canJoin && !stake.isOwner && (
                                    <button
                                        onClick={() => handleJoinStake(stake)}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Join & Support
                                    </button>
                                )}

                                {stake.isOwner && (
                                    <div className="text-center text-sm text-gray-500 py-2">
                                        Your stake
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Join Modal */}
            {selectedStake && (
                <JoinStakeModal
                    stake={selectedStake}
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={handleJoinSuccess}
                />
            )}
        </div>
    );
}
