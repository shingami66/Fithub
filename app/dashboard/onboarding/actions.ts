'use server';

import { requireAuth } from '@/lib/auth/auth';
import { onboardingSchema, type OnboardingInput } from '@/lib/validations/onboarding';
import { saveUserProfile, isOnboardingComplete } from '@/lib/services/user-profile.service';

import { ActionResult } from '@/lib/validations/common';

export async function submitOnboarding(formData: OnboardingInput): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const validatedData = onboardingSchema.parse(formData);

    await saveUserProfile(userId, validatedData);

    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to submit onboarding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
    return { success: false, error: errorMessage };
  }
}

export async function checkOnboardingStatus(): Promise<ActionResult<boolean>> {
  try {
    const session = await requireAuth();
    const isComplete = await isOnboardingComplete(session.user.id);
    return { success: true, data: isComplete };
  } catch {
    return { success: false, error: 'Failed to check onboarding status' };
  }
}
