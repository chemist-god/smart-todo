"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateGoalData, GoalType } from '@/types/goals';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toast';

interface Milestone {
    title: string;
    description: string;
    target: number;
}

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (goalData: CreateGoalData) => void;
}

export default function CreateGoalModal({ isOpen, onClose, onSubmit }: CreateGoalModalProps) {
    const [formData, setFormData] = useState<Omit<CreateGoalData, 'milestones'> & { milestones: Milestone[] }>({
        title: '',
        description: '',
        type: 'TASKS_COMPLETED' as GoalType,
        target: 1,
        unit: 'tasks',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        milestones: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const goalTypes = [
        { value: 'TASKS_COMPLETED', label: 'Tasks Completed', unit: 'tasks' },
        { value: 'POINTS_EARNED', label: 'Points Earned', unit: 'points' },
        { value: 'STREAK_DAYS', label: 'Streak Days', unit: 'days' },
        { value: 'NOTES_CREATED', label: 'Notes Created', unit: 'notes' },
        { value: 'ACHIEVEMENTS_UNLOCKED', label: 'Achievements Unlocked', unit: 'achievements' },
        { value: 'CUSTOM', label: 'Custom', unit: 'units' }
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleTypeChange = (type: GoalType) => {
        const selectedType = goalTypes.find(t => t.value === type);
        setFormData(prev => ({
            ...prev,
            type,
            unit: selectedType?.unit || 'units'
        }));
    };

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [...prev.milestones, { title: '', description: '', target: 1 }]
        }));
    };

    const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.map((milestone, i) =>
                i === index ? { ...milestone, [field]: value } : milestone
            )
        }));
    };

    const removeMilestone = (index: number) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.target < 1) {
            newErrors.target = 'Target must be at least 1';
        }

        if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        // Validate milestones
        formData.milestones.forEach((milestone, index) => {
            if (!milestone.title.trim()) {
                newErrors[`milestone_${index}_title`] = 'Milestone title is required';
            }
            if (milestone.target < 1) {
                newErrors[`milestone_${index}_target`] = 'Milestone target must be at least 1';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            addToast({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fix the errors in the form before submitting.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const goalData: CreateGoalData = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
                milestones: formData.milestones.filter(m => m.title.trim())
            };

            await onSubmit(goalData);
            addToast({
                type: 'success',
                title: 'Goal created',
                message: 'Your new goal has been created successfully!'
            });
            onClose();
        } catch (error) {
            console.error('Error creating goal:', error);
            addToast({
                type: 'error',
                title: 'Failed to create goal',
                message: 'An error occurred while creating the goal. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'TASKS_COMPLETED' as GoalType,
            target: 1,
            unit: 'tasks',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            milestones: []
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Create New Goal</h2>
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
                                <Label htmlFor="title" className="text-sm font-medium mb-2">
                                    Title *
                                </Label>
                                <Input
                                    id="title"
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
                                <Label htmlFor="type" className="text-sm font-medium mb-2">
                                    Type *
                                </Label>
                                <Select value={formData.type} onValueChange={handleTypeChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select goal type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {goalTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-sm font-medium mb-2">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={3}
                                placeholder="Enter goal description (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="target" className="text-sm font-medium mb-2">
                                    Target *
                                </Label>
                                <Input
                                    id="target"
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
                                <Label htmlFor="unit" className="text-sm font-medium mb-2">
                                    Unit
                                </Label>
                                <Input
                                    id="unit"
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value)}
                                    placeholder="e.g., tasks, points, days"
                                />
                            </div>

                            <div>
                                <Label htmlFor="startDate" className="text-sm font-medium mb-2">
                                    Start Date *
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="endDate" className="text-sm font-medium mb-2">
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className={cn(errors.endDate && "border-destructive")}
                                min={formData.startDate}
                            />
                            {errors.endDate && (
                                <p className="text-destructive text-xs mt-1">{errors.endDate}</p>
                            )}
                        </div>

                        {/* Milestones */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-foreground">Milestones (Optional)</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addMilestone}
                                >
                                    Add Milestone
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.milestones.map((milestone, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-foreground">Milestone {index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMilestone(index)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium mb-1">
                                                    Title *
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={milestone.title}
                                                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                                    className={cn(errors[`milestone_${index}_title`] && "border-destructive")}
                                                    placeholder="Milestone title"
                                                />
                                                {errors[`milestone_${index}_title`] && (
                                                    <p className="text-destructive text-xs mt-1">{errors[`milestone_${index}_title`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium mb-1">
                                                    Target *
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={milestone.target}
                                                    onChange={(e) => updateMilestone(index, 'target', parseInt(e.target.value) || 0)}
                                                    className={cn(errors[`milestone_${index}_target`] && "border-destructive")}
                                                    min="1"
                                                />
                                                {errors[`milestone_${index}_target`] && (
                                                    <p className="text-destructive text-xs mt-1">{errors[`milestone_${index}_target`]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Label className="text-sm font-medium mb-1">
                                                Description
                                            </Label>
                                            <Textarea
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                                rows={2}
                                                placeholder="Milestone description (optional)"
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

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
                                        Creating...
                                    </>
                                ) : (
                                    'Create Goal'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
