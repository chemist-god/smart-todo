"use client";

import { useState } from "react";
import { PlusIcon, XMarkIcon, ClockIcon, CalendarIcon } from "@heroicons/react/24/outline";
import DateTimePicker from "./DateTimePicker";

interface CreateTodoButtonProps {
    onTodoCreated?: () => void;
}

export default function CreateTodoButton({ onTodoCreated }: CreateTodoButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Todo
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-xl rounded-xl bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Todo</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Basic Information</h4>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                        placeholder="Add more details about this task..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                    >
                                        <option value="LOW">🟢 Low</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="HIGH">🔴 High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Scheduling & Timing */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 border-b pb-2 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    Scheduling & Timing
                                </h4>

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

                                <div>
                                    <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                        <ClockIcon className="w-4 h-4 inline mr-1" />
                                        Estimated Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        id="estimatedDuration"
                                        name="estimatedDuration"
                                        value={formData.estimatedDuration}
                                        onChange={handleChange}
                                        min="1"
                                        max="480"
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                        placeholder="e.g., 30"
                                    />
                                </div>
                            </div>

                            {/* Recurring Options */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Recurring Options</h4>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isRecurring"
                                        name="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                        disabled={isSubmitting}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                                        Make this a recurring task
                                    </label>
                                </div>

                                {formData.isRecurring && (
                                    <div>
                                        <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 mb-1">
                                            Recurrence Pattern
                                        </label>
                                        <select
                                            id="recurrencePattern"
                                            name="recurrencePattern"
                                            value={formData.recurrencePattern}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            <option value="DAILY">Daily</option>
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="CUSTOM">Custom</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Todo'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
