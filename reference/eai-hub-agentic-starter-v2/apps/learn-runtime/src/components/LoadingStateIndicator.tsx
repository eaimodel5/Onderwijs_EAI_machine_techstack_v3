import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ProcessingStep {
  id: string;
  label: string;
  estimatedMs: number;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'rubrics', label: 'Analyseren van context', estimatedMs: 500 },
  { id: 'eaa', label: 'Empathie evalueren', estimatedMs: 300 },
  { id: 'seed', label: 'Emotie herkennen', estimatedMs: 800 },
  { id: 'llm', label: 'Antwoord creëren', estimatedMs: 2000 }
];

interface LoadingStateIndicatorProps {
  className?: string;
}

export const LoadingStateIndicator: React.FC<LoadingStateIndicatorProps> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= PROCESSING_STEPS.length) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, PROCESSING_STEPS.length));
    }, PROCESSING_STEPS[currentStep].estimatedMs);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <Card className={`glass-strong border-primary-purple/20 animate-fade-slide-in overflow-hidden ${className}`}>
      {/* Progress bar */}
      <div className="h-1 bg-muted/30 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-coral to-primary-purple transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / PROCESSING_STEPS.length) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>

      <div className="p-5 space-y-3">
        {PROCESSING_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div 
              key={step.id}
              className={`flex items-center gap-4 text-sm transition-all duration-300 ${
                isActive ? 'scale-105' : ''
              }`}
            >
              <div className="relative">
                {isCompleted ? (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-glow-sm">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                ) : isActive ? (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-coral to-primary-purple flex items-center justify-center shadow-glow animate-pulse">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center" />
                )}
              </div>
              <div className="flex-1">
                <span className={`block font-medium transition-colors ${
                  isCompleted ? 'text-green-600 dark:text-green-400' : 
                  isActive ? 'gradient-text font-semibold' : 
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
