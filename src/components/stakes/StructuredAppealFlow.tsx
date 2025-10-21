"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertCircle,
    FileText,
    Send,
    Shield,
    ChevronRight,
    ChevronLeft,
    Upload,
    Link,
    Clock,
    CheckCircle,
    AlertTriangle,
    Scale,
    User,
    Calendar
} from "lucide-react";

interface StructuredAppealFlowProps {
    stakeId: string;
    stakeTitle: string;
    stakeDeadline: string;
    totalAmount: number;
    onAppealSubmitted: () => void;
    children: React.ReactNode;
}

type AppealStep = 'overview' | 'reason' | 'evidence' | 'review' | 'confirmation';
type AppealCategory = 'technical' | 'personal' | 'external' | 'unfair' | 'other';

export function StructuredAppealFlow({
    stakeId,
    stakeTitle,
    stakeDeadline,
    totalAmount,
    onAppealSubmitted,
    children
}: StructuredAppealFlowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<AppealStep>('overview');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '' as AppealCategory,
        reason: "",
        evidence: "",
        evidenceType: "text" as "text" | "link" | "file",
        additionalInfo: "",
        urgency: "medium" as "low" | "medium" | "high",
        contactPreference: "email" as "email" | "phone"
    });

    const [error, setError] = useState<string | null>(null);

    const steps = [
        { id: 'overview', title: 'Overview', icon: Shield },
        { id: 'reason', title: 'Reason', icon: AlertCircle },
        { id: 'evidence', title: 'Evidence', icon: FileText },
        { id: 'review', title: 'Review', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    const appealCategories = [
        {
            value: 'technical',
            label: 'Technical Issue',
            description: 'App malfunction, login problems, or system errors',
            icon: AlertTriangle
        },
        {
            value: 'personal',
            label: 'Personal Circumstances',
            description: 'Health issues, family emergency, or unexpected events',
            icon: User
        },
        {
            value: 'external',
            label: 'External Factors',
            description: 'Weather, power outage, or other external disruptions',
            icon: Clock
        },
        {
            value: 'unfair',
            label: 'Unfair Assessment',
            description: 'Believe the penalty was applied incorrectly',
            icon: Scale
        },
        {
            value: 'other',
            label: 'Other',
            description: 'Any other valid reason not listed above',
            icon: FileText
        }
    ];

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1].id as AppealStep);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1].id as AppealStep);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/appeals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stakeId,
                    category: formData.category,
                    reason: formData.reason,
                    evidence: formData.evidence || undefined,
                    additionalInfo: formData.additionalInfo,
                    urgency: formData.urgency,
                    contactPreference: formData.contactPreference
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit appeal");
            }

            setCurrentStep('confirmation');
            setTimeout(() => {
                setIsOpen(false);
                setFormData({
                    category: '' as AppealCategory,
                    reason: "",
                    evidence: "",
                    evidenceType: "text" as "text" | "link" | "file",
                    additionalInfo: "",
                    urgency: "medium" as "low" | "medium" | "high",
                    contactPreference: "email" as "email" | "phone"
                });
                onAppealSubmitted();
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setCurrentStep('overview');
            setFormData({
                category: '' as AppealCategory,
                reason: "",
                evidence: "",
                evidenceType: "text" as "text" | "link" | "file",
                additionalInfo: "",
                urgency: "medium" as "low" | "medium" | "high",
                contactPreference: "email" as "email" | "phone"
            });
            setError(null);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;

                return (
                    <div key={step.id} className="flex items-center">
                        <div className={`
                            flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                            ${isActive ? 'bg-amber-600 text-white' :
                                isCompleted ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-600'}
                        `}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                <StepIcon className="w-4 h-4" />}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${isActive ? 'text-amber-600' :
                            isCompleted ? 'text-green-600' :
                                'text-gray-500'
                            }`}>
                            {step.title}
                        </span>
                        {index < steps.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-4" />
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderOverviewStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Appeal Your Penalty
                </h3>
                <p className="text-gray-600">
                    Challenge the penalty if you believe it was applied unfairly
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Stake Details</h4>
                <div className="space-y-2 text-sm text-amber-800">
                    <div className="flex justify-between">
                        <span>Title:</span>
                        <span className="font-medium">{stakeTitle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="font-medium">{new Date(stakeDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Penalty Amount:</span>
                        <span className="font-medium">Gh{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Appeal Process</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Appeals are reviewed within 24-48 hours</li>
                    <li>• Provide clear evidence and reasoning</li>
                    <li>• Be honest and specific about your situation</li>
                    <li>• You'll be notified of the decision via email</li>
                </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="text-sm text-red-800">
                        <p className="font-medium">Important:</p>
                        <p>False appeals may result in additional penalties. Only submit if you have a legitimate reason.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleNext} className="flex items-center gap-2">
                    Start Appeal
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const renderReasonStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Why Are You Appealing?
                </h3>
                <p className="text-gray-600">
                    Select the category that best describes your situation
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label className="text-base font-medium">Appeal Category <span className="text-red-500">*</span></Label>
                    <div className="grid gap-3 mt-3">
                        {appealCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as AppealCategory }))}
                                    className={`p-4 rounded-lg border text-left transition-all ${formData.category === category.value
                                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                                        : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className={`w-5 h-5 mt-0.5 ${formData.category === category.value ? 'text-amber-600' : 'text-gray-400'
                                            }`} />
                                        <div>
                                            <div className={`font-medium ${formData.category === category.value ? 'text-amber-900' : 'text-gray-900'
                                                }`}>
                                                {category.label}
                                            </div>
                                            <div className={`text-sm mt-1 ${formData.category === category.value ? 'text-amber-700' : 'text-gray-600'
                                                }`}>
                                                {category.description}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <Label htmlFor="reason">
                        Detailed Explanation <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="reason"
                        placeholder="Provide a detailed explanation of why you believe this penalty should be overturned..."
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        className="min-h-[120px]"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.reason.length}/1000 characters
                    </p>
                </div>

                <div>
                    <Label htmlFor="urgency">
                        Urgency Level
                    </Label>
                    <div className="flex gap-2 mt-2">
                        {[
                            { value: "low", label: "Low", color: "gray" },
                            { value: "medium", label: "Medium", color: "amber" },
                            { value: "high", label: "High", color: "red" }
                        ].map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, urgency: level.value as any }))}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium ${formData.urgency === level.value
                                    ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700`
                                    : `border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
                                    }`}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!formData.category || !formData.reason.trim()}
                    className="flex items-center gap-2"
                >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const renderEvidenceStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Supporting Evidence
                </h3>
                <p className="text-gray-600">
                    Provide evidence to support your appeal (optional but recommended)
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label>Evidence Type</Label>
                    <div className="flex gap-2 mt-2">
                        {[
                            { value: "text", label: "Text Description", icon: FileText },
                            { value: "link", label: "Link/URL", icon: Link },
                            { value: "file", label: "File Upload", icon: Upload }
                        ].map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, evidenceType: type.value as any }))}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${formData.evidenceType === type.value
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <Label htmlFor="evidence">
                        Evidence {formData.evidenceType === 'file' ? '(Upload)' : ''}
                    </Label>
                    {formData.evidenceType === 'file' ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        </div>
                    ) : (
                        <Input
                            id="evidence"
                            placeholder={
                                formData.evidenceType === 'link'
                                    ? 'https://example.com/evidence'
                                    : 'Describe your evidence...'
                            }
                            value={formData.evidence}
                            onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                        />
                    )}
                </div>

                <div>
                    <Label htmlFor="additionalInfo">
                        Additional Information
                    </Label>
                    <Textarea
                        id="additionalInfo"
                        placeholder="Any additional context or information that might help with your appeal..."
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                        className="min-h-[80px]"
                    />
                </div>

                <div>
                    <Label>Preferred Contact Method</Label>
                    <div className="flex gap-2 mt-2">
                        {[
                            { value: "email", label: "Email" },
                            { value: "phone", label: "Phone" }
                        ].map((method) => (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, contactPreference: method.value as any }))}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium ${formData.contactPreference === method.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex items-center gap-2"
                >
                    Review
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const renderReviewStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Review Your Appeal
                </h3>
                <p className="text-gray-600">
                    Please review all details before submitting
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Appeal Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">
                                {appealCategories.find(c => c.value === formData.category)?.label}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Urgency:</span>
                            <span className="font-medium capitalize">{formData.urgency}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Contact:</span>
                            <span className="font-medium capitalize">{formData.contactPreference}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Reason</h4>
                    <p className="text-sm text-gray-700">{formData.reason}</p>
                </div>

                {formData.evidence && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Evidence</h4>
                        <p className="text-sm text-gray-700">{formData.evidence}</p>
                    </div>
                )}

                {formData.additionalInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                        <p className="text-sm text-gray-700">{formData.additionalInfo}</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Appeal
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    const renderConfirmationStep = () => (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Appeal Submitted Successfully!
                </h3>
                <p className="text-gray-600">
                    Your appeal has been submitted and is under review.
                </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-green-800 space-y-1 text-left">
                    <li>• Your appeal will be reviewed within 24-48 hours</li>
                    <li>• You'll receive a notification about the decision</li>
                    <li>• If approved, your penalty will be reduced or waived</li>
                    <li>• You can check the status in your dashboard</li>
                </ul>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        Appeal Penalty
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {renderStepIndicator()}

                    {currentStep === 'overview' && renderOverviewStep()}
                    {currentStep === 'reason' && renderReasonStep()}
                    {currentStep === 'evidence' && renderEvidenceStep()}
                    {currentStep === 'review' && renderReviewStep()}
                    {currentStep === 'confirmation' && renderConfirmationStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
