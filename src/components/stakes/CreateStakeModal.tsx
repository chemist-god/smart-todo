"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface CreateStakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStakeModal({ isOpen, onClose, onSuccess }: CreateStakeModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        stakeType: "SELF_STAKE" as const,
        amount: 10,
        deadline: "",
        taskId: "",
        proofRequired: true,
        allowFriends: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { addToast } = useToast();

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (formData.amount < 5) {
            newErrors.amount = "Minimum stake amount is 5 GHS";
        }

        if (formData.amount > 1000) {
            newErrors.amount = "Maximum stake amount is 1000 GHS";
        }

        if (!formData.deadline) {
            newErrors.deadline = "Deadline is required";
        } else {
            const deadline = new Date(formData.deadline);
            const now = new Date();
            const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            const maxDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

            if (deadline < minDeadline) {
                newErrors.deadline = "Deadline must be at least 24 hours from now";
            }

            if (deadline > maxDeadline) {
                newErrors.deadline = "Deadline cannot be more than 30 days from now";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('/api/stakes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                addToast({ type: 'success', title: 'Success', message: `Stake created successfully! You staked Gh${formData.amount}` });
                onSuccess();
                resetForm();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to create stake" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while creating the stake" });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            stakeType: "SELF_STAKE",
            amount: 10,
            deadline: "",
            taskId: "",
            proofRequired: true,
            allowFriends: false,
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>

                <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Create New Stake</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Stake Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Stake Type
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.stakeType === 'SELF_STAKE'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="stakeType"
                                        value="SELF_STAKE"
                                        checked={formData.stakeType === 'SELF_STAKE'}
                                        onChange={(e) => handleInputChange('stakeType', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Self Stake</div>
                                        <div className="text-sm text-gray-600">I bet on myself to complete this task</div>
                                    </div>
                                </label>

                                <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${formData.stakeType === 'SOCIAL_STAKE'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="stakeType"
                                        value="SOCIAL_STAKE"
                                        checked={formData.stakeType === 'SOCIAL_STAKE'}
                                        onChange={(e) => handleInputChange('stakeType', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">Social Stake</div>
                                        <div className="text-sm text-gray-600">Let friends join and bet on my success</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g., Complete React project"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe what you need to accomplish..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stake Amount (GHS) *
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('amount', Math.max(5, formData.amount - 5))}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <MinusIcon className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                                    min="5"
                                    max="1000"
                                    step="5"
                                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleInputChange('amount', Math.min(1000, formData.amount + 5))}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            <p className="mt-1 text-sm text-gray-600">
                                Minimum: Gh5, Maximum: Gh1000
                            </p>
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deadline *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => handleInputChange('deadline', e.target.value)}
                                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.deadline ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
                        </div>

                        {/* Social Settings */}
                        {formData.stakeType === 'SOCIAL_STAKE' && (
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.allowFriends}
                                        onChange={(e) => handleInputChange('allowFriends', e.target.checked)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Allow friends to join this stake</span>
                                </label>
                            </div>
                        )}

                        {/* Proof Requirements */}
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.proofRequired}
                                    onChange={(e) => handleInputChange('proofRequired', e.target.checked)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Require proof of completion</span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading && <LoadingSpinner size="sm" />}
                                Create Stake
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
