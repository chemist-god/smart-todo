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
                className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Task
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Create New Task</h2>
                                    <p className="text-indigo-100 mt-1">Organize your work with precision and clarity</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 disabled:opacity-50"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200 bg-gray-50">
                            <nav className="flex space-x-8 px-8" aria-label="Tabs">
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
                                            className={`${activeTab === tab.id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                                        >
                                            <Icon className="w-5 h-5 mr-2" />
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            {/* Basic Information Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
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
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 text-lg"
                                                placeholder="What needs to be accomplished?"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 resize-none"
                                                placeholder="Provide additional context, requirements, or notes..."
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                                                Priority Level
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: 'LOW', label: 'Low', color: 'green' },
                                                    { value: 'MEDIUM', label: 'Medium', color: 'amber' },
                                                    { value: 'HIGH', label: 'High', color: 'red' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                                                        disabled={isSubmitting}
                                                        className={`${formData.priority === option.value
                                                            ? `bg-${option.color}-100 border-${option.color}-500 text-${option.color}-700`
                                                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                                            } p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2`}
                                                    >
                                                        {getPriorityIcon(option.value)}
                                                        <span className="font-medium">{option.label}</span>
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
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                                Due Date & Time
                                            </h3>
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
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                <ClockIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                                Time Estimation
                                            </h3>
                                            <div>
                                                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Estimated Duration
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
                                                        className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50"
                                                        placeholder="30"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                        <span className="text-gray-500 text-sm font-medium">minutes</span>
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
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <ArrowPathIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                            Recurring Settings
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="isRecurring"
                                                    name="isRecurring"
                                                    checked={formData.isRecurring}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                                    disabled={isSubmitting}
                                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="isRecurring" className="ml-3 text-sm font-medium text-gray-700">
                                                    Make this a recurring task
                                                </label>
                                            </div>

                                            {formData.isRecurring && (
                                                <div className="mt-4">
                                                    <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Recurrence Pattern
                                                    </label>
                                                    <select
                                                        id="recurrencePattern"
                                                        name="recurrencePattern"
                                                        value={formData.recurrencePattern}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50"
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

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
                                <div className="text-sm text-gray-500">
                                    {formData.title && (
                                        <span className="flex items-center">
                                            <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                                            Ready to create
                                        </span>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.title.trim()}
                                        className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            )}
        </>
    );
}
