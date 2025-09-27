import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'ar';

type Dict = Record<string, { en: string; ar: string }>;

const strings: Dict = {
  welcome_back: { en: 'Welcome back, Sarah!', ar: 'مرحباً بعودتك يا سارة!' },
  continue_journey: { en: 'Continue your Islamic learning journey with Al-Abraar', ar: 'واصلي رحلتك التعليمية الإسلامية مع البراء' },
  upcoming_lessons: { en: 'Upcoming Lessons', ar: 'الدروس القادمة' },
  view_all: { en: 'View All', ar: 'عرض الجميع' },
  manage_schedule: { en: "Manage Schedule", ar: 'إدارة الجدول' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof strings) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('al-abraar-lang') as Lang) || 'en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('al-abraar-lang', lang);
  }, [lang]);

  const t = useMemo(() => (key: keyof typeof strings) => strings[key]?.[lang] ?? key, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
