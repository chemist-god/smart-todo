"use client";

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { GoalWithProgress, UpdateGoalData, GoalType } from '@/types/goals';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from "sonner";

interface Milestone {
    id?: string;
    title: string;
    description: string;
    target: number;
    current: number;
}

interface EditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (goalId: string, goalData: UpdateGoalData) => void;
    goal: GoalWithProgress | null;
}

export default function EditGoalModal({ isOpen, onClose, onSubmit, goal }: EditGoalModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target: 1,
        unit: '',
        endDate: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const { addToast } = useToast();

    const goalTypes = [
        { value: 'TASKS_COMPLETED', label: 'Tasks Completed' },
        { value: 'POINTS_EARNED', label: 'Points Earned' },
        { value: 'STREAK_DAYS', label: 'Streak Days' },
        { value: 'NOTES_CREATED', label: 'Notes Created' },
        { value: 'ACHIEVEMENTS_UNLOCKED', label: 'Achievements Unlocked' },
        { value: 'CUSTOM', label: 'Custom' }
    ];

    // Populate form when goal changes
    useEffect(() => {
        if (goal && isOpen) {
            setFormData({
                title: goal.title,
                description: goal.description || '',
                target: goal.target,
                unit: goal.unit,
                endDate: goal.endDate ? goal.endDate.toISOString().split('T')[0] : ''
            });
            setErrors({});
        }
    }, [goal, isOpen]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.target < 1) {
            newErrors.target = 'Target must be at least 1';
        }

        if (formData.endDate && goal && new Date(formData.endDate) <= new Date(goal.startDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!goal) return;

        if (!validateForm()) {
            toast.error('Validation Error', { description: 'Please fix the errors in the form before submitting.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const goalData: UpdateGoalData = {
                title: formData.title,
                description: formData.description || undefined,
                target: formData.target,
                unit: formData.unit,
                endDate: formData.endDate || undefined
            };

            await onSubmit(goal.id, goalData);
            toast.success('Goal updated', { description: 'Your goal has been updated successfully!' });
            onClose();
        } catch (error) {
            console.error('Error updating goal:', error);
            toast.error('Failed to update goal', { description: 'An error occurred while updating the goal. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    }, [goal, formData, onSubmit, onClose]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Edit Goal</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="p-2"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-title" className="text-sm font-medium mb-2">
                                    Title *
                                </Label>
                                <Input
                                    id="edit-title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={cn(errors.title && "border-destructive")}
                                    placeholder="Enter goal title"
                                />
                                {errors.title && (
                                    <p className="text-destructive text-xs mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2">
                                    Type
                                </Label>
                                <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
                                    {goalTypes.find(t => t.value === goal.type)?.label || goal.type}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Goal type cannot be changed after creation
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-description" className="text-sm font-medium mb-2">
                                Description
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={3}
                                placeholder="Enter goal description (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-target" className="text-sm font-medium mb-2">
                                    Target *
                                </Label>
                                <Input
                                    id="edit-target"
                                    type="number"
                                    value={formData.target}
                                    onChange={(e) => handleInputChange('target', parseInt(e.target.value) || 0)}
                                    className={cn(errors.target && "border-destructive")}
                                    min="1"
                                />
                                {errors.target && (
                                    <p className="text-destructive text-xs mt-1">{errors.target}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="edit-unit" className="text-sm font-medium mb-2">
                                    Unit
                                </Label>
                                <Input
                                    id="edit-unit"
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value)}
                                    placeholder="e.g., tasks, points, days"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-endDate" className="text-sm font-medium mb-2">
                                End Date
                            </Label>
                            <Input
                                id="edit-endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className={cn(errors.endDate && "border-destructive")}
                                min={goal.startDate.toISOString().split('T')[0]}
                            />
                            {errors.endDate && (
                                <p className="text-destructive text-xs mt-1">{errors.endDate}</p>
                            )}
                        </div>

                        {/* Current Progress Info */}
                        <Card className="p-4 bg-muted/20">
                            <h3 className="font-medium text-foreground mb-2">Current Progress</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Current:</span>
                                    <span className="ml-2 font-medium">{(goal.current ?? 0)} {goal.unit}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Progress:</span>
                                    <span className="ml-2 font-medium">{(goal.progress ?? 0).toFixed(1)}%</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: Current progress can only be updated through the goal card actions.
                            </p>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Goal'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
