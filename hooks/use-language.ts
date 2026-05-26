'use client';

import { createContext, useContext } from 'react';
import type { Language, Direction, TranslationKey } from '@/lib/i18n/types';
import { dictionary } from '@/lib/i18n/dictionary';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  direction: 'ltr',
  setLanguage: () => {},
  t: (key) => dictionary.en[key] || key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}
