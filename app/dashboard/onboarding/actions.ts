'use server';

import { requireAuth } from '@/lib/auth/auth';
import { onboardingSchema, type OnboardingInput } from '@/lib/validations/onboarding';
import { saveUserProfile, isOnboardingCompleteSafe } from '@/lib/services/user-profile.service';
import { logger } from '@/lib/utils/logger';

import { ActionResult } from '@/lib/validations/common';

export async function submitOnboarding(formData: OnboardingInput): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const validatedData = onboardingSchema.parse(formData);

    await saveUserProfile(userId, validatedData);

    return { success: true };
  } catch (error: unknown) {
    logger.error('Failed to submit onboarding', error);
    if (error instanceof Error && error.name === 'ZodError') {
      logger.errorFingerprint('ACTION_VALIDATION_FAILED', 'Invalid onboarding submission');
      return { success: false, error: 'Please check your profile details.' };
    }
    return { success: false, error: 'Failed to save profile' };
  }
}

export async function checkOnboardingStatus(): Promise<ActionResult<boolean>> {
  try {
    const session = await requireAuth();
    const isComplete = await isOnboardingCompleteSafe(session.user.id);
    if (!isComplete.ok) {
      return { success: false, error: isComplete.message, errorCode: isComplete.errorCode };
    }
    return { success: true, data: isComplete.data };
  } catch (error) {
    logger.error('Failed to check onboarding status', error);
    return { success: false, error: 'Failed to check onboarding status' };
  }
}
