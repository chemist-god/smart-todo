"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    CheckCircle,
    AlertTriangle,
    Percent,
    FileText,
    Clock,
    Shield,
    ChevronRight,
    ChevronLeft,
    Upload,
    Link,
    Calendar,
    Target
} from "lucide-react";

interface StructuredPartialProgressFlowProps {
    stakeId: string;
    stakeTitle: string;
    stakeDeadline: string;
    totalAmount: number;
    onPartialCompletionSubmitted: () => void;
    children: React.ReactNode;
}

type FlowStep = 'overview' | 'progress' | 'evidence' | 'review' | 'confirmation';

export function StructuredPartialProgressFlow({
    stakeId,
    stakeTitle,
    stakeDeadline,
    totalAmount,
    onPartialCompletionSubmitted,
    children
}: StructuredPartialProgressFlowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<FlowStep>('overview');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        completionPercentage: 50,
        evidence: "",
        evidenceType: "text" as "text" | "link" | "file",
        description: "",
        challenges: "",
        nextSteps: ""
    });

    const [error, setError] = useState<string | null>(null);

    const steps = [
        { id: 'overview', title: 'Overview', icon: Target },
        { id: 'progress', title: 'Progress', icon: Percent },
        { id: 'evidence', title: 'Evidence', icon: FileText },
        { id: 'review', title: 'Review', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    const calculatePenaltyReduction = (percentage: number) => {
        return Math.round(percentage * 0.5);
    };

    const calculateNewPenalty = (percentage: number) => {
        const reduction = calculatePenaltyReduction(percentage);
        return totalAmount - (totalAmount * reduction / 100);
    };

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1].id as FlowStep);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1].id as FlowStep);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/stakes/${stakeId}/partial-completion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    completionPercentage: formData.completionPercentage,
                    evidence: formData.evidence || undefined,
                    description: formData.description,
                    challenges: formData.challenges,
                    nextSteps: formData.nextSteps
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit partial completion");
            }

            setCurrentStep('confirmation');
            setTimeout(() => {
                setIsOpen(false);
                setFormData({
                    completionPercentage: 50,
                    evidence: "",
                    evidenceType: "text",
                    description: "",
                    challenges: "",
                    nextSteps: ""
                });
                onPartialCompletionSubmitted();
            }, 2000);
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
                completionPercentage: 50,
                evidence: "",
                evidenceType: "text",
                description: "",
                challenges: "",
                nextSteps: ""
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
                            ${isActive ? 'bg-blue-600 text-white' :
                                isCompleted ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-600'}
                        `}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                <StepIcon className="w-4 h-4" />}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${isActive ? 'text-blue-600' :
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Submit Partial Progress
                </h3>
                <p className="text-gray-600">
                    Show what you've accomplished to reduce your penalty
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Stake Details</h4>
                <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                        <span>Title:</span>
                        <span className="font-medium">{stakeTitle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="font-medium">{new Date(stakeDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Original Penalty:</span>
                        <span className="font-medium">Gh{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Benefits of Partial Completion</h4>
                <ul className="text-sm text-green-800 space-y-1">
                    <li>• Reduce penalty by up to 50%</li>
                    <li>• Maintain partial progress streak</li>
                    <li>• Show commitment to improvement</li>
                    <li>• Get credit for work completed</li>
                </ul>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleNext} className="flex items-center gap-2">
                    Start Process
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    const renderProgressStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Percent className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How Much Did You Complete?
                </h3>
                <p className="text-gray-600">
                    Be honest about your progress - this affects your penalty reduction
                </p>
            </div>

            <div className="space-y-4">
                <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formData.completionPercentage}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${formData.completionPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="px-4">
                    <Slider
                        value={[formData.completionPercentage]}
                        onValueChange={(value: number[]) => setFormData(prev => ({ ...prev, completionPercentage: value[0] }))}
                        min={25}
                        max={99}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>25%</span>
                        <span>99%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Percent className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Penalty Reduction</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                            {calculatePenaltyReduction(formData.completionPercentage)}%
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">New Penalty</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                            Gh{calculateNewPenalty(formData.completionPercentage).toFixed(2)}
                        </div>
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
                    disabled={formData.completionPercentage < 25}
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
                    Provide Evidence & Details
                </h3>
                <p className="text-gray-600">
                    Help us understand what you accomplished
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="description">
                        What did you complete? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Describe the specific tasks or milestones you completed..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[100px]"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/500 characters
                    </p>
                </div>

                <div>
                    <Label htmlFor="challenges">
                        What challenges did you face?
                    </Label>
                    <Textarea
                        id="challenges"
                        placeholder="Describe any obstacles or difficulties you encountered..."
                        value={formData.challenges}
                        onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                        className="min-h-[80px]"
                    />
                </div>

                <div>
                    <Label htmlFor="nextSteps">
                        What are your next steps?
                    </Label>
                    <Textarea
                        id="nextSteps"
                        placeholder="How do you plan to complete the remaining work?"
                        value={formData.nextSteps}
                        onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                        className="min-h-[80px]"
                    />
                </div>

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
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
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
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!formData.description.trim()}
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
                    Review Your Submission
                </h3>
                <p className="text-gray-600">
                    Please review all details before submitting
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Progress Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Completion:</span>
                            <span className="font-medium">{formData.completionPercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Penalty Reduction:</span>
                            <span className="font-medium text-green-600">
                                {calculatePenaltyReduction(formData.completionPercentage)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">New Penalty:</span>
                            <span className="font-medium text-blue-600">
                                Gh{calculateNewPenalty(formData.completionPercentage).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                    <p className="text-sm text-gray-700">{formData.description}</p>
                </div>

                {formData.challenges && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Challenges</h4>
                        <p className="text-sm text-gray-700">{formData.challenges}</p>
                    </div>
                )}

                {formData.nextSteps && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
                        <p className="text-sm text-gray-700">{formData.nextSteps}</p>
                    </div>
                )}

                {formData.evidence && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Evidence</h4>
                        <p className="text-sm text-gray-700">{formData.evidence}</p>
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
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Submit Partial Completion
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
                    Submission Successful!
                </h3>
                <p className="text-gray-600">
                    Your partial completion has been submitted and is under review.
                </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-green-800 space-y-1 text-left">
                    <li>• Your submission will be reviewed within 24 hours</li>
                    <li>• You'll receive a notification about the decision</li>
                    <li>• If approved, your penalty will be reduced accordingly</li>
                    <li>• You can continue working on the remaining tasks</li>
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
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        Submit Partial Progress
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {renderStepIndicator()}

                    {currentStep === 'overview' && renderOverviewStep()}
                    {currentStep === 'progress' && renderProgressStep()}
                    {currentStep === 'evidence' && renderEvidenceStep()}
                    {currentStep === 'review' && renderReviewStep()}
                    {currentStep === 'confirmation' && renderConfirmationStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
