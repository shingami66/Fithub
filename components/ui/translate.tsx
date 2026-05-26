'use client';

import { useLanguage } from '@/hooks/use-language';
import type { TranslationKey } from '@/lib/i18n/types';

export function Translate({ tKey }: { tKey: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(tKey)}</>;
}
