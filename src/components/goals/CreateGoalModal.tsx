"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Milestone {
    title: string;
    description: string;
    target: number;
}

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (goalData: any) => void;
}

export default function CreateGoalModal({ isOpen, onClose, onSubmit }: CreateGoalModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'TASKS_COMPLETED',
        target: 1,
        unit: 'tasks',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        milestones: [] as Milestone[]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const handleTypeChange = (type: string) => {
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

    const updateMilestone = (index: number, field: string, value: any) => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const goalData = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
            milestones: formData.milestones.filter(m => m.title.trim())
        };

        onSubmit(goalData);
        onClose();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'TASKS_COMPLETED',
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Create New Goal</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter goal title"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {goalTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Enter goal description (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target *
                                </label>
                                <input
                                    type="number"
                                    value={formData.target}
                                    onChange={(e) => handleInputChange('target', parseInt(e.target.value) || 0)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.target ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    min="1"
                                />
                                {errors.target && (
                                    <p className="text-red-500 text-xs mt-1">{errors.target}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit
                                </label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                min={formData.startDate}
                            />
                            {errors.endDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                            )}
                        </div>

                        {/* Milestones */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Milestones (Optional)</h3>
                                <button
                                    type="button"
                                    onClick={addMilestone}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Add Milestone
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.milestones.map((milestone, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900">Milestone {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeMilestone(index)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={milestone.title}
                                                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`milestone_${index}_title`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Milestone title"
                                                />
                                                {errors[`milestone_${index}_title`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`milestone_${index}_title`]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Target *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={milestone.target}
                                                    onChange={(e) => updateMilestone(index, 'target', parseInt(e.target.value) || 0)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`milestone_${index}_target`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    min="1"
                                                />
                                                {errors[`milestone_${index}_target`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`milestone_${index}_target`]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={milestone.description}
                                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={2}
                                                placeholder="Milestone description (optional)"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
