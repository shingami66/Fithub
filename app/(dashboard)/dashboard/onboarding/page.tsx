import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/auth';
import { isOnboardingComplete } from '@/lib/services/user-profile.service';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';

export default async function OnboardingPage() {
  const session = await requireAuth();

  const isComplete = await isOnboardingComplete(session.user.id);

  if (isComplete) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-950 px-4 py-8">
      {/* Background ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(222,255,154,0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Main onboarding container */}
      <main className="z-10 w-full max-w-[420px]">
        <OnboardingShell />
      </main>
    </div>
  );
}
