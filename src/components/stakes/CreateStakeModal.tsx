"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon, MinusIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TodoSelection from "./TodoSelection";
import DeadlineSelector from "./DeadlineSelector";
import {
    convertDateToDeadline,
    formatDeadlineFromUTC,
    validateDeadlineRange,
} from "@/lib/timezone-utils";

interface CreateStakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStakeModal({ isOpen, onClose, onSuccess }: CreateStakeModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        stakeType: "SELF_STAKE" as "SELF_STAKE" | "SOCIAL_STAKE" | "CHALLENGE_STAKE" | "TEAM_STAKE" | "CHARITY_STAKE",
        amount: 10,
        deadline: "",
        taskId: "",
        proofRequired: true,
        allowFriends: false,
        category: "personal",
        difficulty: "MEDIUM",
        tags: [] as string[],
    });
    const [selectedTodo, setSelectedTodo] = useState<any>(null);
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

    const handleTodoSelect = (todo: any) => {
        setSelectedTodo(todo);
        if (todo) {
            // Pre-fill form with todo data
            let deadlineString = "";

            // If todo has a due date, convert it to a proper deadline
            // Set to end of day (23:59:59) in user's local timezone
            if (todo.dueDate) {
                try {
                    // Convert date-only string to proper deadline (end of day)
                    const deadlineDate = convertDateToDeadline(todo.dueDate);
                    // Format for datetime-local input
                    deadlineString = formatDeadlineFromUTC(deadlineDate);
                } catch (error) {
                    console.error("Error converting todo due date to deadline:", error);
                    // Fallback to empty string if conversion fails
                    deadlineString = "";
                }
            }

            setFormData(prev => ({
                ...prev,
                title: todo.title,
                description: todo.description || "",
                taskId: todo.id,
                category: "personal", // Default category since todos don't have category
                deadline: deadlineString || prev.deadline,
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (formData.amount < 5) {
            newErrors.amount = "Minimum stake amount is ₵5";
        }

        if (formData.amount > 1000) {
            newErrors.amount = "Maximum stake amount is ₵1000";
        }

        if (!formData.deadline) {
            newErrors.deadline = "Deadline is required";
        } else {
            try {
                // Parse deadline string (datetime-local format) to Date
                // The string is in user's local timezone
                const deadline = new Date(formData.deadline);

                // Validate the date is valid
                if (isNaN(deadline.getTime())) {
                    newErrors.deadline = "Invalid deadline format";
                } else {
                    // Use flexible validation (1 hour min, 90 days max)
                    const validation = validateDeadlineRange(deadline, 1, 90);
                    if (!validation.isValid) {
                        newErrors.deadline = validation.error || "Invalid deadline";
                    }
                }
            } catch (error) {
                newErrors.deadline = "Invalid deadline format";
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
                addToast({ type: 'success', title: 'Success', message: `Stake created successfully! You staked ₵${formData.amount}` });
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
            category: "personal",
            difficulty: "MEDIUM",
            tags: [],
        });
        setSelectedTodo(null);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
            <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>

                <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                    {/* Aurora-Themed Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
                        <div className="relative flex items-center justify-between p-4 sm:p-6">
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Create New Stake</h2>
                                <p className="text-sm text-muted-foreground">Set up accountability for your goals</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="group relative p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 touch-manipulation"
                            >
                                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <div className="absolute inset-0 rounded-xl bg-destructive/10 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                            </button>
                        </div>
                    </div>

                    {/* Aurora-Themed Form */}
                    <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                            {/* Stake Type */}
                            <div className="space-y-3">
                                <label className="block text-sm sm:text-base font-semibold text-foreground tracking-tight">
                                    Stake Type
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <label className={`group relative flex items-center p-4 sm:p-5 border rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${formData.stakeType === 'SELF_STAKE'
                                        ? 'border-primary bg-primary/5 shadow-soft'
                                        : 'border-border/50 hover:border-border bg-card/50 hover:bg-card/80'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="stakeType"
                                            value="SELF_STAKE"
                                            checked={formData.stakeType === 'SELF_STAKE'}
                                            onChange={(e) => handleInputChange('stakeType', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">Self Stake</div>
                                            <div className="text-sm text-muted-foreground leading-relaxed">I bet on myself to complete this task</div>
                                        </div>
                                        {formData.stakeType === 'SELF_STAKE' && (
                                            <div className="ml-3 p-1 rounded-lg bg-primary/10">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            </div>
                                        )}
                                    </label>

                                    <label className={`group relative flex items-center p-4 sm:p-5 border rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${formData.stakeType === 'SOCIAL_STAKE'
                                        ? 'border-primary bg-primary/5 shadow-soft'
                                        : 'border-border/50 hover:border-border bg-card/50 hover:bg-card/80'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="stakeType"
                                            value="SOCIAL_STAKE"
                                            checked={formData.stakeType === 'SOCIAL_STAKE'}
                                            onChange={(e) => handleInputChange('stakeType', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">Social Stake</div>
                                            <div className="text-sm text-muted-foreground leading-relaxed">Let friends join and bet on my success</div>
                                        </div>
                                        {formData.stakeType === 'SOCIAL_STAKE' && (
                                            <div className="ml-3 p-1 rounded-lg bg-primary/10">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Todo Selection */}
                            <div className="border-t border-gray-200 pt-6">
                                <TodoSelection
                                    onTodoSelect={handleTodoSelect}
                                    selectedTodo={selectedTodo}
                                />
                            </div>

                            {/* Category and Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="personal">Personal Development</option>
                                        <option value="fitness">Fitness & Health</option>
                                        <option value="work">Work & Career</option>
                                        <option value="learning">Learning & Skills</option>
                                        <option value="creative">Creative Projects</option>
                                        <option value="social">Social & Relationships</option>
                                        <option value="financial">Financial Goals</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                        <option value="EXTREME">Extreme</option>
                                    </select>
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
                                    Stake Amount (₵) *
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
                                    Minimum: ₵5, Maximum: ₵1000
                                </p>
                            </div>

                            {/* Deadline - New Flexible Selector */}
                            <DeadlineSelector
                                value={formData.deadline}
                                onChange={(deadline) => handleInputChange('deadline', deadline)}
                                error={errors.deadline}
                            />

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

                            {/* Aurora-Themed Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/30 mt-6">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="group relative flex-1 px-4 py-3 border border-border bg-card hover:bg-muted text-foreground rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                                >
                                    <span>Cancel</span>
                                    <div className="absolute inset-0 rounded-xl bg-muted/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 touch-manipulation flex items-center justify-center gap-2"
                                >
                                    {isLoading && <LoadingSpinner size="sm" />}
                                    <span>{isLoading ? 'Creating...' : 'Create Stake'}</span>
                                    <div className="absolute inset-0 rounded-xl bg-primary-foreground/10 scale-0 group-hover:scale-100 group-disabled:scale-0 transition-transform duration-200"></div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
