'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GoalStep } from '@/components/onboarding/goal-step';
import { BasicInfoStep } from '@/components/onboarding/basic-info-step';
import { ActivityStep } from '@/components/onboarding/activity-step';
import { SummaryStep } from '@/components/onboarding/summary-step';
import { WeeklyTargetStep } from '@/components/onboarding/weekly-target-step';
import { submitOnboarding } from '@/app/dashboard/onboarding/actions';
import type { OnboardingInput } from '@/lib/validations/onboarding';

export function OnboardingShell() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<OnboardingInput>>({});

  const goNext = (stepData: Partial<OnboardingInput>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Type casting here as we only reach summary when all required data is collected
    const result = await submitOnboarding(formData as OnboardingInput);

    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.error || 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
      {/* Progress indicator */}
      <div className="mb-8 flex justify-center gap-2">
        {[0, 1, 2, 3, 4].map((stepIndex) => (
          <div
            key={stepIndex}
            className={`h-1 w-12 rounded-full transition-colors duration-500 ${
              stepIndex <= currentStep ? 'bg-[#7dd3fc]' : 'bg-white/[0.06]'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full"
        >
          {currentStep === 0 && (
            <BasicInfoStep
              data={formData}
              onUpdate={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
              onNext={() => goNext({})}
              onBack={() => router.push('/dashboard')}
            />
          )}

          {currentStep === 1 && (
            <ActivityStep
              selectedLevel={formData.activityLevel as string | null}
              onNext={(level) =>
                goNext({ activityLevel: level as OnboardingInput['activityLevel'] })
              }
              onBack={goBack}
            />
          )}

          {currentStep === 2 && (
            <GoalStep
              selectedGoal={formData.fitnessGoal as string | null}
              onNext={(goal) => goNext({ fitnessGoal: goal as OnboardingInput['fitnessGoal'] })}
              onBack={goBack}
            />
          )}

          {currentStep === 3 && (
            <WeeklyTargetStep
              fitnessGoal={formData.fitnessGoal}
              selectedTarget={formData.weeklyWeightChange ?? null}
              onNext={(weeklyWeightChange) => goNext({ weeklyWeightChange })}
              onBack={goBack}
            />
          )}

          {currentStep === 4 && (
            <SummaryStep
              formData={formData as OnboardingInput}
              onSubmit={handleSubmit}
              onBack={goBack}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
