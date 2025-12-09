"use client";

import { useState, ReactNode } from "react";

interface Step {
	title: string;
	content: ReactNode;
}

interface StepByStepDemoProps {
	steps: Step[];
	title?: string;
	description?: string;
}

export function StepByStepDemo({
	steps,
	title,
	description,
}: StepByStepDemoProps) {
	const [currentStep, setCurrentStep] = useState(0);

	const goToStep = (step: number) => {
		if (step >= 0 && step < steps.length) {
			setCurrentStep(step);
		}
	};

	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	return (
		<div className="my-8 border border-border rounded-lg overflow-hidden">
			{(title || description) && (
				<div className="px-4 py-3 border-b border-border bg-muted/50">
					{title && (
						<h4 className="text-sm font-semibold text-foreground mb-1">
							{title}
						</h4>
					)}
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}

			<div className="p-6 bg-background">
				{/* Step indicators */}
				<div className="flex items-center justify-between mb-6">
					{steps.map((step, index) => (
						<div key={index} className="flex items-center flex-1">
							<button
								onClick={() => goToStep(index)}
								className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
									index === currentStep
										? "bg-primary text-primary-foreground"
										: index < currentStep
										? "bg-primary/20 text-primary"
										: "bg-muted text-muted-foreground"
								}`}
								aria-label={`Go to step ${index + 1}: ${step.title}`}
							>
								{index + 1}
							</button>
							{index < steps.length - 1 && (
								<div
									className={`flex-1 h-0.5 mx-2 ${
										index < currentStep ? "bg-primary" : "bg-muted"
									}`}
								/>
							)}
						</div>
					))}
				</div>

				{/* Current step content */}
				<div className="mb-6">
					<h5 className="text-base font-semibold text-foreground mb-3">
						Step {currentStep + 1}: {steps[currentStep].title}
					</h5>
					<div className="text-sm text-foreground">
						{steps[currentStep].content}
					</div>
				</div>

				{/* Navigation buttons */}
				<div className="flex items-center justify-between pt-4 border-t border-border">
					<button
						onClick={prevStep}
						disabled={currentStep === 0}
						className="px-4 py-2 text-sm font-medium rounded-md bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Previous
					</button>
					<span className="text-xs text-muted-foreground">
						{currentStep + 1} of {steps.length}
					</span>
					<button
						onClick={nextStep}
						disabled={currentStep === steps.length - 1}
						className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
