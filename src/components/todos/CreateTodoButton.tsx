"use client";

import { useState, useCallback, useEffect } from "react";
import {
    PlusIcon,
    XMarkIcon,
    ClockIcon,
    CalendarIcon,
    TagIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    SparklesIcon
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

// Sanitization helper - only removes dangerous characters, preserves spaces
const sanitizeInput = (input: string): string => {
    // Only remove potentially dangerous characters, preserve all spaces
    return input.replace(/[<>]/g, '');
};

// Sanitization for validation (trims for validation purposes only)
const sanitizeForValidation = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

// Live validation helpers
const validateTitle = (title: string): string | undefined => {
    const sanitized = sanitizeForValidation(title);
    if (!sanitized) return "Task title is required";
    if (sanitized.length < 3) return "Title must be at least 3 characters";
    if (title.length > 255) return "Title must be less than 255 characters";
    return undefined;
};

const validateDescription = (description: string): string | undefined => {
    if (!description) return undefined;
    const sanitized = sanitizeForValidation(description);
    if (description.length > 1000) return "Description must be less than 1000 characters";
    return undefined;
};

const validateDate = (date: string): string | undefined => {
    if (!date) return undefined;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Please enter a valid date";
    if (dateObj < new Date(new Date().setHours(0, 0, 0, 0))) {
        return "Date cannot be in the past";
    }
    return undefined;
};

const validateDuration = (duration: string): string | undefined => {
    if (!duration) return undefined;
    const num = parseInt(duration);
    if (isNaN(num)) return "Duration must be a number";
    if (num < 1) return "Duration must be at least 1 minute";
    if (num > 480) return "Duration cannot exceed 480 minutes (8 hours)";
    return undefined;
};

const PRIORITIES = [
    {
        value: 'LOW',
        label: 'Low',
        emoji: '🟢',
        color: 'success',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        selectedBg: 'bg-emerald-100 dark:bg-emerald-900/50',
        selectedBorder: 'border-emerald-400 dark:border-emerald-600',
        ringColor: 'ring-emerald-200 dark:ring-emerald-800',
        dotColor: 'bg-emerald-500'
    },
    {
        value: 'MEDIUM',
        label: 'Medium',
        emoji: '🟡',
        color: 'warning',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        textColor: 'text-amber-700 dark:text-amber-400',
        selectedBg: 'bg-amber-100 dark:bg-amber-900/50',
        selectedBorder: 'border-amber-400 dark:border-amber-600',
        ringColor: 'ring-amber-200 dark:ring-amber-800',
        dotColor: 'bg-amber-500'
    },
    {
        value: 'HIGH',
        label: 'High',
        emoji: '🔴',
        color: 'destructive',
        bgColor: 'bg-rose-50 dark:bg-rose-950/30',
        borderColor: 'border-rose-200 dark:border-rose-800',
        textColor: 'text-rose-700 dark:text-rose-400',
        selectedBg: 'bg-rose-100 dark:bg-rose-900/50',
        selectedBorder: 'border-rose-400 dark:border-rose-600',
        ringColor: 'ring-rose-200 dark:ring-rose-800',
        dotColor: 'bg-rose-500'
    }
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
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

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

    // Live validation with sanitization - only show errors for touched fields
    useEffect(() => {
        const errors: ValidationErrors = {};

        // Validate title - only show error if field has been touched
        if (touchedFields.has('title')) {
            const titleError = validateTitle(formData.title);
            if (titleError) errors.title = titleError;
        }

        // Validate description - only show error if field has been touched
        if (touchedFields.has('description')) {
            const descError = validateDescription(formData.description);
            if (descError) errors.description = descError;
        }

        // Validate date - only show error if field has been touched
        if (touchedFields.has('dueDate') && formData.dueDate) {
            const dateError = validateDate(formData.dueDate);
            if (dateError) errors.dueDate = dateError;
        }

        // Validate duration - only show error if field has been touched
        if (touchedFields.has('estimatedDuration') && formData.estimatedDuration) {
            const durationError = validateDuration(formData.estimatedDuration);
            if (durationError) errors.estimatedDuration = durationError;
        }

        setValidationErrors(errors);
    }, [formData.title, formData.description, formData.dueDate, formData.estimatedDuration, touchedFields]);

    const validateAll = useCallback(() => {
        const errors: ValidationErrors = {};

        const titleError = validateTitle(formData.title);
        if (titleError) errors.title = titleError;

        const descError = validateDescription(formData.description);
        if (descError) errors.description = descError;

        if (formData.dueDate) {
            const dateError = validateDate(formData.dueDate);
            if (dateError) errors.dueDate = dateError;
        }

        if (formData.estimatedDuration) {
            const durationError = validateDuration(formData.estimatedDuration);
            if (durationError) errors.estimatedDuration = durationError;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

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
        // Mark field as touched when user starts typing
        if (!touchedFields.has(field)) {
            setTouchedFields(prev => new Set(prev).add(field));
        }

        // For text inputs, only remove dangerous characters, preserve all spaces while typing
        if (typeof value === 'string' && (field === 'title' || field === 'description')) {
            // Only remove potentially dangerous characters, keep all spaces including trailing ones
            value = value.replace(/[<>]/g, '');
        }
        
        setFormData(prev => ({ ...prev, [field]: value }));
    }, [touchedFields]);

    const handleFieldBlur = useCallback((field: string) => {
        // Mark field as touched when user leaves the field
        if (!touchedFields.has(field)) {
            setTouchedFields(prev => new Set(prev).add(field));
        }
    }, [touchedFields]);

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
        setTouchedFields(new Set());
        setActiveTab('basic');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Mark all fields as touched before validation so errors show on submit
        setTouchedFields(new Set(['title', 'description', 'dueDate', 'estimatedDuration']));

        // Validate all fields (validateAll always validates, but errors only show for touched fields)
        // We need to validate and show all errors on submit
        const errors: ValidationErrors = {};
        const titleError = validateTitle(formData.title);
        if (titleError) errors.title = titleError;
        const descError = validateDescription(formData.description);
        if (descError) errors.description = descError;
        if (formData.dueDate) {
            const dateError = validateDate(formData.dueDate);
            if (dateError) errors.dueDate = dateError;
        }
        if (formData.estimatedDuration) {
            const durationError = validateDuration(formData.estimatedDuration);
            if (durationError) errors.estimatedDuration = durationError;
        }

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            setActiveTab('basic'); // Go to first tab with errors
            toast.error("Please fix the errors below", "Some fields need your attention", 4000);
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data for submission - trim whitespace only on submit
            const submitData = {
                ...formData,
                // Trim title and description on submit for clean data
                title: formData.title.trim(),
                description: formData.description.trim(),
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
        { id: 'basic' as const, name: 'Basic', icon: TagIcon, color: 'text-primary' },
        { id: 'schedule' as const, name: 'Schedule', icon: CalendarIcon, color: 'text-info' },
        { id: 'advanced' as const, name: 'Advanced', icon: ArrowPathIcon, color: 'text-warning' }
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
                <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-card border-0 sm:border border-border/50 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-screen sm:max-h-[90vh]">
                        {/* Modern Header */}
                        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/30 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10">
                                        <SparklesIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-foreground">Create New Task</h2>
                                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Organize your workflow with clarity</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 disabled:opacity-50 active:scale-95"
                                    aria-label="Close"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modern Tab Navigation */}
                            <nav className="flex gap-2 sm:gap-3">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    const tabIndex = tabs.findIndex(t => t.id === tab.id);
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                                                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                                            <span className="hidden sm:inline">{tab.name}</span>
                                            <span className="sm:hidden">{tab.name.charAt(0)}</span>
                                            {isActive && (
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground/30 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                            {/* Basic Information Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-4 sm:space-y-5">
                                        <div className="space-y-2">
                                            <label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                Task Title
                                                <span className="text-destructive text-xs">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="title"
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                    onBlur={() => handleFieldBlur('title')}
                                                    disabled={isSubmitting}
                                                    className={`w-full px-4 py-3 sm:py-3.5 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 text-sm sm:text-base placeholder:text-muted-foreground/50 ${validationErrors.title ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border'
                                                        }`}
                                                    placeholder="What needs to be accomplished?"
                                                    maxLength={255}
                                                />
                                                {formData.title && !validationErrors.title && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <CheckCircleIcon className="w-5 h-5 text-success" />
                                                    </div>
                                                )}
                                            </div>
                                            {validationErrors.title && (
                                                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span>{validationErrors.title}</span>
                                                </p>
                                            )}
                                            {formData.title && !validationErrors.title && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formData.title.length}/255 characters
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="description" className="text-sm font-semibold text-foreground">
                                                Description
                                                <span className="text-xs text-muted-foreground font-normal ml-2">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    id="description"
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    onBlur={() => handleFieldBlur('description')}
                                                    rows={4}
                                                    disabled={isSubmitting}
                                                    className={`w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 resize-none placeholder:text-muted-foreground/50 text-sm sm:text-base ${validationErrors.description ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border'
                                                        }`}
                                                    placeholder="Add context, requirements, or notes..."
                                                    maxLength={1000}
                                                />
                                                {formData.description && !validationErrors.description && (
                                                    <div className="absolute right-3 top-3">
                                                        <CheckCircleIcon className="w-5 h-5 text-success" />
                                                    </div>
                                                )}
                                            </div>
                                            {validationErrors.description && (
                                                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span>{validationErrors.description}</span>
                                                </p>
                                            )}
                                            {formData.description && !validationErrors.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formData.description.length}/1000 characters
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-foreground">Priority Level</label>
                                            <div className="flex flex-wrap gap-2">
                                                {PRIORITIES.map((option) => {
                                                    const isSelected = formData.priority === option.value;
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => handleInputChange('priority', option.value)}
                                                            disabled={isSubmitting}
                                                            className={`group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all duration-200 disabled:opacity-50 active:scale-95 ${isSelected
                                                                ? `${option.selectedBg} ${option.selectedBorder} ${option.textColor} border-2 shadow-sm ring-2 ${option.ringColor} ring-offset-1 ring-offset-background`
                                                                : `${option.bgColor} ${option.borderColor} ${option.textColor} border hover:shadow-sm`
                                                                } ${option.value === 'LOW' && !isSelected ? 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700' :
                                                                    option.value === 'MEDIUM' && !isSelected ? 'hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700' :
                                                                        option.value === 'HIGH' && !isSelected ? 'hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700' : ''
                                                                }`}
                                                        >
                                                            <span className="text-sm leading-none">{option.emoji}</span>
                                                            <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                                                            {isSelected && (
                                                                <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${option.dotColor} rounded-full border border-background shadow-sm`}></div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Schedule Tab */}
                            {activeTab === 'schedule' && (
                                <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-info/10">
                                                    <CalendarIcon className="w-4 h-4 text-info" />
                                                </div>
                                                <h3 className="text-sm sm:text-base font-semibold text-foreground">Due Date & Time</h3>
                                            </div>
                                            <div className={`p-4 rounded-xl border transition-all duration-200 ${validationErrors.dueDate ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/20'
                                                }`}>
                                                <DateTimePicker
                                                    value={{
                                                        date: formData.dueDate,
                                                        startTime: formData.scheduledStartTime,
                                                        endTime: formData.scheduledEndTime,
                                                        timeZone: formData.timeZone,
                                                    }}
                                                    onChange={(value) => {
                                                        handleFieldBlur('dueDate');
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
                                            {validationErrors.dueDate && (
                                                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span>{validationErrors.dueDate}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <ClockIcon className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-sm sm:text-base font-semibold text-foreground">Time Estimation</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="estimatedDuration" className="text-xs sm:text-sm font-medium text-foreground">
                                                    Estimated Duration
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        id="estimatedDuration"
                                                        value={formData.estimatedDuration}
                                                        onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                                                        onBlur={() => handleFieldBlur('estimatedDuration')}
                                                        min="1"
                                                        max="480"
                                                        disabled={isSubmitting}
                                                        className={`w-full px-4 py-3 pr-16 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50 placeholder:text-muted-foreground/50 text-sm sm:text-base ${validationErrors.estimatedDuration ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border'
                                                            }`}
                                                        placeholder="30"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                                        <span className="text-muted-foreground text-xs sm:text-sm font-medium">min</span>
                                                    </div>
                                                    {formData.estimatedDuration && !validationErrors.estimatedDuration && (
                                                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                                                            <CheckCircleIcon className="w-5 h-5 text-success" />
                                                        </div>
                                                    )}
                                                </div>
                                                {validationErrors.estimatedDuration && (
                                                    <p className="text-xs sm:text-sm text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                                        <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                                        <span>{validationErrors.estimatedDuration}</span>
                                                    </p>
                                                )}
                                                {formData.estimatedDuration && !validationErrors.estimatedDuration && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {Math.floor(parseInt(formData.estimatedDuration) / 60)}h {parseInt(formData.estimatedDuration) % 60}m
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Advanced Tab */}
                            {activeTab === 'advanced' && (
                                <div className="space-y-5 sm:space-y-6 max-w-2xl mx-auto">
                                    <div className="bg-gradient-to-br from-warning/5 via-muted/30 to-transparent rounded-xl p-5 sm:p-6 border border-border/30">
                                        <div className="flex items-start gap-3 sm:gap-4 mb-5">
                                            <div className="p-2.5 rounded-xl bg-warning/10 flex-shrink-0">
                                                <ArrowPathIcon className="w-5 h-5 text-warning" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">Recurring Settings</h3>
                                                <p className="text-xs sm:text-sm text-muted-foreground">Create repeating tasks automatically</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${formData.isRecurring
                                                ? 'bg-warning/5 border-warning/20'
                                                : 'bg-background/50 border-border/50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    id="isRecurring"
                                                    checked={formData.isRecurring}
                                                    onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                                                    disabled={isSubmitting}
                                                    className="h-5 w-5 text-warning bg-background border-2 border-border rounded focus:ring-warning/20 focus:ring-2 transition-all duration-200 cursor-pointer"
                                                />
                                                <label htmlFor="isRecurring" className="text-sm sm:text-base font-medium text-foreground cursor-pointer flex-1">
                                                    Make this a recurring task
                                                </label>
                                            </div>

                                            {formData.isRecurring && (
                                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 pl-2">
                                                    <label htmlFor="recurrencePattern" className="text-xs sm:text-sm font-semibold text-foreground block">
                                                        Recurrence Pattern
                                                    </label>
                                                    <select
                                                        id="recurrencePattern"
                                                        value={formData.recurrencePattern}
                                                        onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                                                        disabled={isSubmitting}
                                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-warning/20 focus:border-warning transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
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
                            <div className="flex-shrink-0 border-t border-border/30 bg-muted/10 px-4 sm:px-6 py-4 sm:py-5 mt-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 max-w-2xl mx-auto">
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                        {formData.title && !validationErrors.title && (
                                            <span className="flex items-center gap-2 animate-in fade-in-0">
                                                <CheckCircleIcon className="w-4 h-4 text-success" />
                                                <span className="hidden sm:inline">Ready to create</span>
                                                <span className="sm:hidden">Ready</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={isSubmitting}
                                            className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-border/50 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !formData.title.trim() || !!validationErrors.title}
                                            className="flex-1 sm:flex-initial px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 border border-transparent rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 disabled:active:scale-100"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground"></div>
                                                    <span className="hidden sm:inline">Creating...</span>
                                                    <span className="sm:hidden">...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="hidden sm:inline">Create Task</span>
                                                    <span className="sm:hidden">Create</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
