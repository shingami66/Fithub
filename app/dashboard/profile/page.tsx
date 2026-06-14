/**
 * ProfilePage
 *
 * Protected Server Component for "/dashboard/profile".
 * It reads the user's saved onboarding profile, shows derived nutrition
 * targets, and includes client language/sign-out controls.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type React from 'react';
import { Activity, ArrowRight, Flame, Settings, Shield, Target, User } from 'lucide-react';
import { DatabaseUnavailableState } from '@/components/states/database-unavailable-state';
import { auth } from '@/lib/auth/auth';
import { getUserProfileSafe } from '@/lib/services/user-profile.service';
import type { OnboardingInput } from '@/lib/validations/onboarding';
import { Translate } from '@/components/ui/translate';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { SignOutButton } from '@/components/auth/sign-out-button';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Profile documents are keyed by userId, which keeps each user's plan isolated.
  const profileResult = await getUserProfileSafe(session.user.id, { timeoutMs: 1500 });
  if (!profileResult.ok) {
    return (
      <div className="flex min-h-full flex-col bg-[#050505] p-6 pb-32">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              <Translate tKey="Profile" />
            </h1>
            <p className="mt-1 text-sm text-neutral-500">Your saved plan and account settings.</p>
          </div>
          <DatabaseUnavailableState />
        </div>
      </div>
    );
  }

  const profile = profileResult.data;
  if (!profile?.onboardingCompleted) {
    redirect('/dashboard/onboarding');
  }

  return (
    <div className="flex min-h-full flex-col bg-[#050505] p-6 pb-32">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            <Translate tKey="Profile" />
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Your saved plan and account settings.</p>
        </div>

        <section className="mb-5 rounded-3xl border border-white/[0.05] bg-[#040816] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#7dd3fc]/20 bg-[#7dd3fc]/10">
                <User className="h-8 w-8 text-[#7dd3fc]" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-white">
                  {session.user.name || 'Athlete'}
                </h2>
                <p className="truncate text-sm text-neutral-500">{session.user.email}</p>
              </div>
            </div>

            <Link
              href="/dashboard/onboarding?edit=1"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/10 px-4 py-3 text-sm font-semibold text-[#7dd3fc] transition-colors hover:bg-[#7dd3fc]/15"
            >
              <Translate tKey="Edit" />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/[0.05] bg-[#040816] p-6">
            <div className="mb-5 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#7dd3fc]" />
              <h3 className="text-sm font-bold text-white">
                <Translate tKey="Current plan" />
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileMetric label="Goal" value={formatGoal(profile.fitnessGoal)} />
              <ProfileMetric
                label="Weekly target"
                value={formatWeeklyTarget(profile.weeklyWeightChange)}
              />
              <ProfileMetric label="Activity" value={formatActivity(profile.activityLevel)} />
              <ProfileMetric label="Calories" value={`${profile.dailyCalories} kcal`} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MacroTile label="Protein" value={profile.macros.protein} />
              <MacroTile label="Carbs" value={profile.macros.carbs} />
              <MacroTile label="Fat" value={profile.macros.fat} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.05] bg-[#040816] p-6">
            <div className="mb-5 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#7dd3fc]" />
              <h3 className="text-sm font-bold text-white">
                <Translate tKey="Body stats" />
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ProfileMetric label="Weight" value={`${profile.weightKg} kg`} />
              <ProfileMetric label="Height" value={`${profile.heightCm} cm`} />
              <ProfileMetric label="Age" value={`${profile.age}`} />
              <ProfileMetric label="Gender" value={profile.gender} />
              <ProfileMetric label="BMR" value={`${profile.bmr} kcal`} />
              <ProfileMetric label="TDEE" value={`${profile.tdee} kcal`} />
            </div>
          </section>
        </div>

        <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.05] bg-[#040816]">
          <SettingsRow icon={<Shield className="h-5 w-5" />} title="Privacy & Security" />
          <SettingsRow icon={<Settings className="h-5 w-5" />} title="App Settings" muted />

          {/* Language Toggle inserted here */}
          <LanguageToggle />

          <SignOutButton />
        </section>
      </div>
    </div>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-white">{value}</p>
    </div>
  );
}

function MacroTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#7dd3fc]/10 bg-[#7dd3fc]/[0.03] p-4">
      <div className="flex items-center gap-2 text-[#7dd3fc]">
        <Flame className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}g</p>
    </div>
  );
}

function SettingsRow({
  icon,
  title,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  muted?: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-4 border-b border-white/[0.02] p-5 text-left transition-colors hover:bg-white/[0.02]">
      <span className={muted ? 'text-neutral-600' : 'text-neutral-400'}>{icon}</span>
      <div>
        <p
          className={
            muted ? 'text-sm font-medium text-neutral-500' : 'text-sm font-medium text-white'
          }
        >
          {title}
        </p>
        {muted && <p className="mt-0.5 text-xs text-neutral-600">Coming later</p>}
      </div>
    </div>
  );
}

function formatGoal(goal: OnboardingInput['fitnessGoal']) {
  return goal.replace('_', ' ');
}

function formatActivity(activity: OnboardingInput['activityLevel']) {
  return activity.replace('_', ' ');
}

function formatWeeklyTarget(target: OnboardingInput['weeklyWeightChange']) {
  const labels: Record<OnboardingInput['weeklyWeightChange'], string> = {
    lose_0_25: 'lose 0.25 kg/week',
    lose_0_5: 'lose 0.5 kg/week',
    lose_1: 'lose 1 kg/week',
    maintain: 'maintain',
    gain_0_25: 'gain 0.25 kg/week',
    gain_0_5: 'gain 0.5 kg/week',
  };

  return labels[target];
}
