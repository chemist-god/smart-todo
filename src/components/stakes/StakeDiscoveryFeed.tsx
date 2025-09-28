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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Discover Stakes</h2>
                    <p className="text-gray-600">Find and join stakes from the community</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <span className="text-sm text-gray-500">
                        {stakes.length} stakes available
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search stakes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stakes Grid */}
            {stakes.length === 0 ? (
                <div className="text-center py-12">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No stakes found</h3>
                    <p className="text-gray-500">Try adjusting your filters or check back later</p>
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
