import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepDef {
  id: string;
  label: string;
}

interface StepWizardProps {
  steps: StepDef[];
  currentStep: string;
}

export function StepWizard({ steps, currentStep }: StepWizardProps) {
  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;

        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  isDone && "bg-primary border-primary text-primary-foreground",
                  isActive &&
                    "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone &&
                    !isActive &&
                    "border-border text-muted-foreground bg-background",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] whitespace-nowrap font-medium",
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-primary/60"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-10 sm:w-16 mx-1.5 mt-4 rounded-full transition-all duration-500",
                  i < currentIdx ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
