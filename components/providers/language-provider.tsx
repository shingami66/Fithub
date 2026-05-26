'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { LanguageContext } from '@/hooks/use-language';
import type { Language, Direction } from '@/lib/i18n/types';
import { dictionary } from '@/lib/i18n/dictionary';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Start with default English to match server HTML (hydration safety)
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage only after mount
    const savedLang = localStorage.getItem('app_language') as Language | null;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  // Safe direction: if not mounted, we default to ltr to match server rendering.
  // After mount, direction follows the selected language.
  const direction: Direction = mounted && language === 'ar' ? 'rtl' : 'ltr';

  const t = useCallback(
    (key: keyof typeof dictionary.en) => {
      // Provide English translation before hydration to match server output
      const lang = mounted ? language : 'en';
      return dictionary[lang]?.[key] || key;
    },
    [language, mounted],
  );

  const contextValue = useMemo(
    () => ({ language, direction, setLanguage, t }),
    [language, direction, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <div dir={direction}>{children}</div>
    </LanguageContext.Provider>
  );
}
