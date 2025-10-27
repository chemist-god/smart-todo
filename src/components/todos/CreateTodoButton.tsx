"use client";

import { useState } from "react";
import {
    PlusIcon,
    XMarkIcon,
    ClockIcon,
    CalendarIcon,
    TagIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import DateTimePicker from "./DateTimePicker";

interface CreateTodoButtonProps {
    onTodoCreated?: () => void;
}

export default function CreateTodoButton({ onTodoCreated }: CreateTodoButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'advanced'>('basic');
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        // Enhanced scheduling fields
        scheduledStartTime: "",
        scheduledEndTime: "",
        estimatedDuration: "",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isRecurring: false,
        recurrencePattern: "DAILY",
        reminderSettings: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create todo');
            }

            // Reset form and close modal
            setFormData({
                title: "",
                description: "",
                dueDate: "",
                priority: "MEDIUM",
                scheduledStartTime: "",
                scheduledEndTime: "",
                estimatedDuration: "",
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                isRecurring: false,
                recurrencePattern: "DAILY",
                reminderSettings: null,
            });
            setIsOpen(false);

            // Notify parent component to refresh
            if (onTodoCreated) {
                onTodoCreated();
            }
        } catch (error) {
            console.error('Error creating todo:', error);
            alert('Failed to create todo. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'MEDIUM': return <ClockIcon className="w-4 h-4" />;
            case 'LOW': return <CheckCircleIcon className="w-4 h-4" />;
            default: return <TagIcon className="w-4 h-4" />;
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-soft hover:shadow-medium hover:-translate-y-0.5 focus-enhanced"
            >
                <PlusIcon className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                <span className="hidden sm:inline">Create Task</span>
                <span className="sm:hidden">New</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto z-50 p-4">
                    <div className="flex items-center justify-center min-h-full">
                        <div className="relative w-full max-w-4xl bg-card border border-border rounded-xl shadow-strong overflow-hidden">
                            {/* Enhanced Header */}
                            <div className="bg-gradient-to-r from-primary to-primary/60 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-primary-foreground">Create New Task</h2>
                                        <p className="text-primary-foreground/80 mt-1 text-sm">Organize your work with precision and clarity</p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        disabled={isSubmitting}
                                        className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20 rounded-lg p-2 transition-all duration-200 disabled:opacity-50 focus-enhanced"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced Tab Navigation */}
                            <div className="border-b border-border bg-muted/30">
                                <nav className="flex gap-1 px-6" aria-label="Tabs">
                                    {[
                                        { id: 'basic', name: 'Basic Info', icon: TagIcon },
                                        { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
                                        { id: 'advanced', name: 'Advanced', icon: ArrowPathIcon }
                                    ].map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={`${
                                                    activeTab === tab.id
                                                        ? 'bg-primary text-primary-foreground shadow-soft'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                } flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus-enhanced`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {tab.name}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {/* Basic Information Tab */}
                                {activeTab === 'basic' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="title" className="block text-sm font-semibold text-foreground">
                                                    Task Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    required
                                                    disabled={isSubmitting}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 text-base focus-enhanced"
                                                    placeholder="What needs to be accomplished?"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="description" className="block text-sm font-semibold text-foreground">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    disabled={isSubmitting}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 resize-none focus-enhanced"
                                                    placeholder="Provide additional context, requirements, or notes..."
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-foreground">
                                                    Priority Level
                                                </label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { value: 'LOW', label: 'Low', color: 'green' },
                                                        { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
                                                        { value: 'HIGH', label: 'High', color: 'red' }
                                                    ].map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                                                            disabled={isSubmitting}
                                                            className={`${
                                                                formData.priority === option.value
                                                                    ? `bg-${option.color}-50 dark:bg-${option.color}-950/30 border-${option.color}-200 dark:border-${option.color}-800/30 text-${option.color}-700 dark:text-${option.color}-300`
                                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border-border'
                                                            } p-4 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 flex flex-col items-center gap-2 focus-enhanced`}
                                                        >
                                                            {getPriorityIcon(option.value)}
                                                            <span className="font-medium text-sm">{option.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule Tab */}
                                {activeTab === 'schedule' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                                    <h3 className="text-lg font-semibold text-foreground">Due Date & Time</h3>
                                                </div>
                                                <DateTimePicker
                                                    value={{
                                                        date: formData.dueDate,
                                                        startTime: formData.scheduledStartTime,
                                                        endTime: formData.scheduledEndTime,
                                                        timeZone: formData.timeZone,
                                                    }}
                                                    onChange={(value) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            dueDate: value.date || "",
                                                            scheduledStartTime: value.startTime || "",
                                                            scheduledEndTime: value.endTime || "",
                                                            timeZone: value.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                        }));
                                                    }}
                                                    showEndTime={true}
                                                    showTimeZone={true}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-5 h-5 text-primary" />
                                                    <h3 className="text-lg font-semibold text-foreground">Time Estimation</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="estimatedDuration" className="block text-sm font-medium text-foreground">
                                                        Estimated Duration (minutes)
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            id="estimatedDuration"
                                                            name="estimatedDuration"
                                                            value={formData.estimatedDuration}
                                                            onChange={handleChange}
                                                            min="1"
                                                            max="480"
                                                            disabled={isSubmitting}
                                                            className="w-full px-4 py-3 pr-20 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 focus-enhanced"
                                                            placeholder="30"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                            <span className="text-muted-foreground text-sm font-medium">min</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Advanced Tab */}
                                {activeTab === 'advanced' && (
                                    <div className="space-y-6">
                                        <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <ArrowPathIcon className="w-5 h-5 text-primary" />
                                                <h3 className="text-lg font-semibold text-foreground">Recurring Settings</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id="isRecurring"
                                                        name="isRecurring"
                                                        checked={formData.isRecurring}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                                        disabled={isSubmitting}
                                                        className="h-4 w-4 text-primary bg-background border border-border rounded focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                                                    />
                                                    <label htmlFor="isRecurring" className="text-sm font-medium text-foreground">
                                                        Make this a recurring task
                                                    </label>
                                                </div>

                                                {formData.isRecurring && (
                                                    <div className="space-y-2">
                                                        <label htmlFor="recurrencePattern" className="block text-sm font-medium text-foreground">
                                                            Recurrence Pattern
                                                        </label>
                                                        <select
                                                            id="recurrencePattern"
                                                            name="recurrencePattern"
                                                            value={formData.recurrencePattern}
                                                            onChange={handleChange}
                                                            disabled={isSubmitting}
                                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 focus-enhanced"
                                                        >
                                                            <option value="DAILY">Daily</option>
                                                            <option value="WEEKLY">Weekly</option>
                                                            <option value="MONTHLY">Monthly</option>
                                                            <option value="CUSTOM">Custom</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced Action Buttons */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-border">
                                    <div className="text-sm text-muted-foreground">
                                        {formData.title && (
                                            <span className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                                Ready to create
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-all duration-200 disabled:opacity-50 focus-enhanced"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !formData.title.trim()}
                                            className="px-8 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 border border-transparent rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium focus-enhanced"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground"></div>
                                                    Creating Task...
                                                </div>
                                            ) : (
                                                'Create Task'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
