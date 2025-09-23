"use client";

import { useState } from 'react';
import { Goal, Milestone } from '@prisma/client';
import { useGoals } from '@/hooks/useData';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface GoalWithProgress extends Goal {
    progress: number;
    completedMilestones: number;
    totalMilestones: number;
    isOverdue: boolean;
    milestones: Milestone[];
}

export default function GoalList() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Use enhanced hook with real-time updates
    const {
        goals,
        isLoading: loading,
        addGoal,
        updateGoal,
        deleteGoal
    } = useGoals(filter, typeFilter);

    const handleCreateGoal = async (goalData: any) => {
        try {
            await addGoal(goalData);
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    const handleEditGoal = (goal: GoalWithProgress) => {
        // TODO: Implement edit functionality
        console.log('Edit goal:', goal);
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) {
            return;
        }

        try {
            await deleteGoal(goalId);
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const handleToggleActive = async (goalId: string, isActive: boolean) => {
        try {
            await updateGoal(goalId, { isActive });
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const handleUpdateProgress = async (goalId: string, current: number) => {
        try {
            await updateGoal(goalId, { current });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const getGoalTypeOptions = () => {
        const types = [...new Set(goals.map(goal => goal.type))];
        return types.map(type => ({
            value: type,
            label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
        }));
    };

    const getStats = () => {
        const total = goals.length;
        const active = goals.filter(g => g.isActive && !g.isCompleted).length;
        const completed = goals.filter(g => g.isCompleted).length;
        const overdue = goals.filter(g => g.isOverdue).length;

        return { total, active, completed, overdue };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
                    <p className="text-gray-600">Track your productivity goals and milestones</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Goal
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Goals</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                    <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">All Goals</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">All Types</option>
                        {getGoalTypeOptions().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
                    <p className="text-gray-500 mb-6">
                        {filter === 'all'
                            ? "Get started by creating your first goal!"
                            : `No ${filter} goals found. Try adjusting your filters.`
                        }
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Your First Goal
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onEdit={handleEditGoal}
                            onDelete={handleDeleteGoal}
                            onToggleActive={handleToggleActive}
                            onUpdateProgress={handleUpdateProgress}
                        />
                    ))}
                </div>
            )}

            {/* Create Goal Modal */}
            <CreateGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateGoal}
            />
        </div>
    );
}
