'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Language } from '@/lib/i18n/types';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex w-full items-center justify-between border-b border-white/[0.02] p-5 transition-colors hover:bg-white/[0.02]">
      <div>
        <p className="text-sm font-medium text-white">{t('Language')}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{t('Select language')}</p>
      </div>
      <select
        className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-sm text-white focus:border-[#7dd3fc] focus:outline-none focus:ring-1 focus:ring-[#7dd3fc]"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        <option value="en">{t('English')}</option>
        <option value="ar">{t('Arabic')}</option>
      </select>
    </div>
  );
}
