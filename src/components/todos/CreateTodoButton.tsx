"use client";

import { useState, useCallback } from "react";
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
import { toast } from "@/components/ui/Toast";

interface CreateTodoButtonProps {
    onTodoCreated?: (newTodo: any) => void;
}

interface ValidationErrors {
    title?: string;
    description?: string;
    dueDate?: string;
    estimatedDuration?: string;
    general?: string;
}

const PRIORITIES = [
    { value: 'LOW', label: 'Low', emoji: '🟢', color: 'success' },
    { value: 'MEDIUM', label: 'Medium', emoji: '🟡', color: 'warning' },
    { value: 'HIGH', label: 'High', emoji: '🔴', color: 'destructive' }
] as const;

const RECURRENCE_OPTIONS = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'CUSTOM', label: 'Custom' }
] as const;

export default function CreateTodoButton({ onTodoCreated }: CreateTodoButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'advanced'>('basic');
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM" as typeof PRIORITIES[number]['value'],
        scheduledStartTime: "",
        scheduledEndTime: "",
        estimatedDuration: "",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isRecurring: false,
        recurrencePattern: "DAILY" as typeof RECURRENCE_OPTIONS[number]['value'],
        focusMode: false,
        breakDuration: "",
    });

    // Validation functions
    const validateBasicInfo = useCallback(() => {
        const errors: ValidationErrors = {};

        if (!formData.title.trim()) {
            errors.title = "Task title is required";
        } else if (formData.title.length > 255) {
            errors.title = "Title must be less than 255 characters";
        }

        if (formData.description && formData.description.length > 1000) {
            errors.description = "Description must be less than 1000 characters";
        }

        return errors;
    }, [formData.title, formData.description]);

    const validateScheduleInfo = useCallback(() => {
        const errors: ValidationErrors = {};

        if (formData.dueDate && isNaN(new Date(formData.dueDate).getTime())) {
            errors.dueDate = "Please enter a valid date";
        }

        if (formData.estimatedDuration) {
            const duration = parseInt(formData.estimatedDuration);
            if (isNaN(duration) || duration < 1 || duration > 480) {
                errors.estimatedDuration = "Duration must be between 1 and 480 minutes";
            }
        }

        return errors;
    }, [formData.dueDate, formData.estimatedDuration]);

    const validateAll = useCallback(() => {
        const basicErrors = validateBasicInfo();
        const scheduleErrors = validateScheduleInfo();
        const allErrors = { ...basicErrors, ...scheduleErrors };

        setValidationErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    }, [validateBasicInfo, validateScheduleInfo]);

    // Helper functions
    const combineDateTime = useCallback((dateStr: string, timeStr: string): string | null => {
        if (!dateStr || !timeStr) return null;
        try {
            const dateTimeStr = `${dateStr}T${timeStr}`;
            const date = new Date(dateTimeStr);
            return date.toISOString();
        } catch (error) {
            console.error('Error combining date and time:', error);
            return null;
        }
    }, []);

    const handleInputChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear validation error for this field when user starts typing
        if (validationErrors[field as keyof ValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [validationErrors]);

    const resetForm = useCallback(() => {
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
            focusMode: false,
            breakDuration: "",
        });
        setValidationErrors({});
        setActiveTab('basic');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validate all fields
        if (!validateAll()) {
            setActiveTab('basic'); // Go to first tab with errors
            toast.error("Please fix the errors below", "Some fields need your attention", 4000);
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data for submission
            const submitData = {
                ...formData,
                // Combine date and time for API submission
                scheduledStartTime: combineDateTime(formData.dueDate, formData.scheduledStartTime),
                scheduledEndTime: combineDateTime(formData.dueDate, formData.scheduledEndTime),
                // Convert to proper types
                estimatedDuration: formData.estimatedDuration || null,
                breakDuration: formData.breakDuration || null,
            };

            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Failed to create todo (${response.status})`;
                throw new Error(errorMessage);
            }

            const newTodo = await response.json();

            // Success - reset form and close modal
            resetForm();
            setIsOpen(false);

            // Show success toast
            toast.success(
                "Task created successfully!",
                `"${newTodo.title}" has been added to your todo list.`,
                3000
            );

            // Notify parent component with the new todo for optimistic updates
            if (onTodoCreated) {
                onTodoCreated(newTodo);
            }

        } catch (error) {
            console.error('Error creating todo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create todo. Please try again.';

            // Show error toast with specific message
            toast.error(
                "Failed to create task",
                errorMessage,
                5000
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = useCallback(() => {
        resetForm();
        setIsOpen(false);
    }, [resetForm]);

    const tabs = [
        { id: 'basic' as const, name: 'Basic', icon: TagIcon },
        { id: 'schedule' as const, name: 'Schedule', icon: CalendarIcon },
        { id: 'advanced' as const, name: 'Advanced', icon: ArrowPathIcon }
    ];

    return (
        <>
            {/* Sleek Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 focus-enhanced"
                title="Create New Task"
                disabled={isSubmitting}
            >
                <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="relative w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Minimal Header */}
                        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold text-foreground">Create New Task</h2>
                                    <p className="text-sm text-muted-foreground">Organize your workflow with clarity</p>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-2 mt-4">
                                {tabs.map((tab, index) => (
                                    <div
                                        key={tab.id}
                                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                            activeTab === tab.id ? 'bg-primary' : 'bg-muted'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sleek Tab Navigation */}
                        <div className="border-b border-border/30 bg-muted/20">
                            <nav className="flex px-6">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative flex-1 flex flex-col items-center gap-1.5 py-4 px-2 text-xs font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span>{tab.name}</span>
                                            {isActive && (
                                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Basic Information Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-1">
                                                Task Title
                                                <span className="text-destructive">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                disabled={isSubmitting}
                                                className={`w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 text-base placeholder:text-muted-foreground/60 focus-enhanced ${
                                                    validationErrors.title ? 'border-destructive' : 'border-border'
                                                }`}
                                                placeholder="What needs to be accomplished?"
                                            />
                                            {validationErrors.title && (
                                                <p className="text-sm text-destructive flex items-center gap-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                                    {validationErrors.title}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="description" className="text-sm font-medium text-foreground">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                rows={3}
                                                disabled={isSubmitting}
                                                className={`w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 resize-none placeholder:text-muted-foreground/60 focus-enhanced ${
                                                    validationErrors.description ? 'border-destructive' : 'border-border'
                                                }`}
                                                placeholder="Add context, requirements, or notes..."
                                            />
                                            {validationErrors.description && (
                                                <p className="text-sm text-destructive flex items-center gap-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                                    {validationErrors.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-foreground">Priority Level</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {PRIORITIES.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleInputChange('priority', option.value)}
                                                        disabled={isSubmitting}
                                                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 focus-enhanced ${
                                                            formData.priority === option.value
                                                                ? `bg-${option.color}/10 border-${option.color}/30 text-${option.color} shadow-sm`
                                                                : 'bg-muted/50 border-border hover:bg-muted/80 hover:border-border/50 text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className={`p-2 rounded-lg transition-colors duration-200 ${
                                                                formData.priority === option.value
                                                                    ? `bg-${option.color}/20`
                                                                    : 'bg-background/50 group-hover:bg-background'
                                                            }`}>
                                                                <span className="text-lg">{option.emoji}</span>
                                                            </div>
                                                            <span className="font-medium text-sm">{option.label}</span>
                                                        </div>
                                                        {formData.priority === option.value && (
                                                            <div className={`absolute -top-1 -right-1 w-3 h-3 bg-${option.color} rounded-full border border-background`}></div>
                                                        )}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10">
                                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-base font-semibold text-foreground">Due Date & Time</h3>
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
                                            {validationErrors.dueDate && (
                                                <p className="text-sm text-destructive flex items-center gap-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                                    {validationErrors.dueDate}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-primary/10">
                                                    <ClockIcon className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-base font-semibold text-foreground">Time Estimation</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="estimatedDuration" className="text-sm font-medium text-foreground">
                                                    Estimated Duration (minutes)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        id="estimatedDuration"
                                                        value={formData.estimatedDuration}
                                                        onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                                                        min="1"
                                                        max="480"
                                                        disabled={isSubmitting}
                                                        className={`w-full px-4 py-3 pr-16 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 placeholder:text-muted-foreground/60 focus-enhanced ${
                                                            validationErrors.estimatedDuration ? 'border-destructive' : 'border-border'
                                                        }`}
                                                        placeholder="30"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                        <span className="text-muted-foreground text-sm font-medium">min</span>
                                                    </div>
                                                </div>
                                                {validationErrors.estimatedDuration && (
                                                    <p className="text-sm text-destructive flex items-center gap-1">
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                        {validationErrors.estimatedDuration}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Advanced Tab */}
                            {activeTab === 'advanced' && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <ArrowPathIcon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">Recurring Settings</h3>
                                                <p className="text-sm text-muted-foreground">Create repeating tasks automatically</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                                                <input
                                                    type="checkbox"
                                                    id="isRecurring"
                                                    checked={formData.isRecurring}
                                                    onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                                                    disabled={isSubmitting}
                                                    className="h-4 w-4 text-primary bg-background border-2 border-border rounded focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                                                />
                                                <label htmlFor="isRecurring" className="text-sm font-medium text-foreground cursor-pointer">
                                                    Make this a recurring task
                                                </label>
                                            </div>

                                            {formData.isRecurring && (
                                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                    <label htmlFor="recurrencePattern" className="text-sm font-medium text-foreground">
                                                        Recurrence Pattern
                                                    </label>
                                                    <select
                                                        id="recurrencePattern"
                                                        value={formData.recurrencePattern}
                                                        onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 focus-enhanced"
                                                    >
                                                        {RECURRENCE_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-8 mt-8 border-t border-border/50">
                                <div className="text-sm text-muted-foreground">
                                    {formData.title && (
                                        <span className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-4 h-4 text-success" />
                                            Ready to create
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-border/50 rounded-xl transition-all duration-200 disabled:opacity-50 focus-enhanced"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.title.trim()}
                                        className="px-8 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 border border-transparent rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium focus-enhanced disabled:hover:bg-primary"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground"></div>
                                                Creating...
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
