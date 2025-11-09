"use client";

import { useState, useMemo } from 'react';
import { GoalWithProgress, GoalStats, GoalFilter } from '@/types/goals';
import { useGoals } from '@/hooks/useData';
import GoalCard from './GoalCard';
import CreateGoalModal from './CreateGoalModal';
import EditGoalModal from './EditGoalModal';
import { PlusIcon, FunnelIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toast';

export default function GoalList() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null);
    const [filter, setFilter] = useState<GoalFilter['status']>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const { addToast } = useToast();

    // Use enhanced hook with real-time updates
    const {
        goals,
        isLoading,
        isError,
        addGoal,
        updateGoal,
        deleteGoal
    } = useGoals(filter, typeFilter);

    const handleCreateGoal = async (goalData: any) => {
        setIsLoadingAction(true);
        try {
            await addGoal(goalData);
            addToast({
                type: 'success',
                title: 'Goal created',
                message: 'Your new goal has been created successfully!'
            });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating goal:', error);
            addToast({
                type: 'error',
                title: 'Failed to create goal',
                message: 'Please try again or contact support if the issue persists.'
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleEditGoal = (goal: GoalWithProgress) => {
        setEditingGoal(goal);
        setIsEditModalOpen(true);
    };

    const handleEditGoalSubmit = async (goalId: string, goalData: UpdateGoalData) => {
        setIsLoadingAction(true);
        try {
            await updateGoal(goalId, goalData);
            addToast({
                type: 'success',
                title: 'Goal updated',
                message: 'Your goal has been updated successfully!'
            });
            setIsEditModalOpen(false);
            setEditingGoal(null);
        } catch (error) {
            console.error('Error updating goal:', error);
            addToast({
                type: 'error',
                title: 'Failed to update goal',
                message: 'Please try again or contact support if the issue persists.'
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this goal? This action cannot be undone.');
        if (!confirmed) return;

        setIsLoadingAction(true);
        try {
            await deleteGoal(goalId);
            addToast({
                type: 'success',
                title: 'Goal deleted',
                message: 'The goal has been deleted successfully.'
            });
        } catch (error) {
            console.error('Error deleting goal:', error);
            addToast({
                type: 'error',
                title: 'Failed to delete goal',
                message: 'Please try again or contact support if the issue persists.'
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleToggleActive = async (goalId: string, isActive: boolean) => {
        setIsLoadingAction(true);
        try {
            await updateGoal(goalId, { isActive });
            addToast({
                type: 'success',
                title: isActive ? 'Goal activated' : 'Goal paused',
                message: `The goal has been ${isActive ? 'activated' : 'paused'} successfully.`
            });
        } catch (error) {
            console.error('Error updating goal:', error);
            addToast({
                type: 'error',
                title: 'Failed to update goal',
                message: 'Please try again or contact support if the issue persists.'
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleUpdateProgress = async (goalId: string, current: number) => {
        setIsLoadingAction(true);
        try {
            await updateGoal(goalId, { current });
            addToast({
                type: 'success',
                title: 'Progress updated',
                message: 'Your goal progress has been updated successfully!'
            });
        } catch (error) {
            console.error('Error updating progress:', error);
            addToast({
                type: 'error',
                title: 'Failed to update progress',
                message: 'Please try again or contact support if the issue persists.'
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const getGoalTypeOptions = useMemo(() => {
        const goalsArray = Array.isArray(goals) ? goals : [];
        const types = [...new Set(goalsArray.map(goal => goal.type))];
        return types.map(type => ({
            value: type,
            label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
        }));
    }, [goals]);

    const stats: GoalStats = useMemo(() => {
        const goalsArray = Array.isArray(goals) ? goals : [];
        return {
            total: goalsArray.length,
            active: goalsArray.filter(g => g.isActive && !g.isCompleted).length,
            completed: goalsArray.filter(g => g.isCompleted).length,
            overdue: goalsArray.filter(g => g.isOverdue).length
        };
    }, [goals]);

    // Show error state if there's an error
    if (isError) {
        return (
            <div className="space-y-6">
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
                            <div>
                                <h3 className="font-semibold text-destructive">Failed to load goals</h3>
                                <p className="text-sm text-muted-foreground">
                                    There was an error loading your goals. Please try refreshing the page.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 bg-muted rounded"></div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Goals</h1>
                    <p className="text-muted-foreground">Track your productivity goals and milestones</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={isLoadingAction}
                    className="w-full sm:w-auto"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {isLoadingAction ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Creating...
                        </>
                    ) : (
                        'New Goal'
                    )}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total Goals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{stats.active}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-success">{stats.completed}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                    </CardContent>
                </Card>
                <Card className={stats.overdue > 0 ? "border-destructive/20 bg-destructive/5" : ""}>
                    <CardContent className="p-4">
                        <div className={cn(
                            "text-2xl font-bold",
                            stats.overdue > 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                            {stats.overdue}
                        </div>
                        <div className="text-sm text-muted-foreground">Overdue</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Filters:</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <Select value={filter} onValueChange={(value: GoalFilter['status']) => setFilter(value)}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="All Goals" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Goals</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {getGoalTypeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Goals List */}
            {(Array.isArray(goals) ? goals : []).length === 0 ? (
                <Card className="text-center">
                    <CardContent className="p-12">
                        <div className="text-muted-foreground mb-4">
                            <CheckCircleIcon className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No goals found</h3>
                        <p className="text-muted-foreground mb-6">
                            {filter === 'all'
                                ? "Get started by creating your first goal!"
                                : `No ${filter} goals found. Try adjusting your filters.`
                            }
                        </p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            disabled={isLoadingAction}
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Your First Goal
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {(Array.isArray(goals) ? goals : []).map((goal: GoalWithProgress) => (
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

            {/* Edit Goal Modal */}
            <EditGoalModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingGoal(null);
                }}
                onSubmit={handleEditGoalSubmit}
                goal={editingGoal}
            />
        </div>
    );
}
