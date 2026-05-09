"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "tr",
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");
  const toggle = useCallback(() => setLocale((l) => (l === "tr" ? "en" : "tr")), []);

  return (
    <LanguageContext.Provider value={{ locale, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Helper: Kısa kullanım — t(obj, locale)
 * Örnek: tx(t.hero.cta, locale) → "Launch System"
 */
export function tx(dict: { tr: string; en: string }, locale: Locale): string {
  return dict[locale];
}
