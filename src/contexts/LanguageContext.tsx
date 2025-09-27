import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'ar';

type Dict = Record<string, { en: string; ar: string }>;

const strings = {
  brand_name: { en: 'Al-Abraar', ar: 'البراء' },
  nav_sign_in: { en: 'Sign In', ar: 'تسجيل الدخول' },
  nav_register: { en: 'Register', ar: 'إنشاء حساب' },
  language_toggle_en: { en: 'Switch to English', ar: 'التبديل إلى الإنجليزية' },
  language_toggle_ar: { en: 'Switch to Arabic', ar: 'التبديل إلى العربية' },
  hero_title_main: { en: 'Al-Abraar Online', ar: 'مدرسة البراء' },
  hero_title_highlight: { en: 'Modrasah', ar: 'الإلكترونية' },
  hero_description: {
    en: "Connect with verified Islamic teachers for personalized Qur'an, Tajweed, Hadeeth, and Arabic lessons",
    ar: 'تواصل مع معلمين إسلاميين موثوقين لدروس شخصية في القرآن والتجويد والحديث واللغة العربية',
  },
  hero_cta: { en: 'Start Your Journey', ar: 'ابدأ رحلتك' },

  // Features
  feature_quality_title: { en: 'Quality Education', ar: 'تعليم ذو جودة' },
  feature_quality_description: {
    en: 'Learn from certified Ustaadhs with proven expertise in Islamic studies',
    ar: 'تعلم من معلمين معتمدين يتمتعون بخبرة مثبتة في العلوم الإسلامية',
  },
  feature_flexible_title: { en: 'Flexible Scheduling', ar: 'جدولة مرنة' },
  feature_flexible_description: {
    en: 'Book lessons at your convenience with our smart scheduling system',
    ar: 'احجز الدروس في الوقت الذي يناسبك عبر نظام الجدولة الذكي لدينا',
  },
  feature_secure_title: { en: 'Safe & Secure', ar: 'آمن وموثوق' },
  feature_secure_description: {
    en: 'All teachers are verified and approved by our administration team',
    ar: 'يتم التحقق من جميع المعلمين والموافقة عليهم من قبل فريق الإدارة لدينا',
  },

  // Why choose
  why_choose_heading: { en: 'Why Choose Al-Abraar?', ar: 'لماذا تختار البراء؟' },
  why_choose_verified_title: { en: 'Verified Teachers', ar: 'معلمون موثوقون' },
  why_choose_verified_description: {
    en: 'All Ustaadhs undergo thorough verification and approval process',
    ar: 'جميع المعلمين يخضعون لعملية تحقق وموافقة دقيقة',
  },
  why_choose_rating_title: { en: 'Rating System', ar: 'نظام التقييم' },
  why_choose_rating_description: {
    en: 'Student reviews and ratings help you choose the best teacher',
    ar: 'مراجعات وتقييمات الطلاب تساعدك على اختيار أفضل معلم',
  },
  why_choose_global_title: { en: 'Global Access', ar: 'وصول عالمي' },
  why_choose_global_description: {
    en: 'Connect with teachers from around the world, learn from anywhere',
    ar: 'اتصل بالمعلمين من أنحاء العالم وتعلم من أي مكان',
  },

  // Packages
  packages_heading: { en: 'Course Packages', ar: 'باقات الدورات' },
  packages_quran_title: { en: "Qur'an & Tajweed", ar: 'القرآن والتجويد' },
  packages_quran_description: {
    en: 'Perfect for beginners and intermediate learners',
    ar: 'مثالية للمبتدئين والمتعلمين من المستوى المتوسط',
  },
  packages_quran_price: { en: '$5', ar: '$5' },
  packages_complete_title: { en: 'Complete Islamic Studies', ar: 'الدراسات الإسلامية الشاملة' },
  packages_complete_description: {
    en: "Qur'an, Tajweed, Hadeeth & Arabic language",
    ar: 'القرآن والتجويد والحديث واللغة العربية',
  },
  packages_complete_price: { en: '$7', ar: '$7' },
  packages_price_suffix: { en: '/hour', ar: 'لكل ساعة' },

  // CTA
  cta_heading: {
    en: 'Ready to Begin Your Islamic Learning Journey?',
    ar: 'هل أنت مستعد لبدء رحلتك التعليمية الإسلامية؟',
  },
  cta_subheading: {
    en: 'Join thousands of students learning with verified Islamic teachers worldwide',
    ar: 'انضم إلى آلاف الطلاب الذين يتعلمون مع معلمين إسلاميين موثوقين حول العالم',
  },
  cta_primary: { en: 'Get Started Today', ar: 'ابدأ اليوم' },

  // Dashboard misc
  welcome_back: { en: 'Welcome back, Sarah!', ar: 'مرحباً بعودتك يا سارة!' },
  continue_journey: {
    en: 'Continue your Islamic learning journey with Al-Abraar',
    ar: 'واصلي رحلتك التعليمية الإسلامية مع البراء',
  },
  upcoming_lessons: { en: 'Upcoming Lessons', ar: 'الدروس القادمة' },
  view_all: { en: 'View All', ar: 'عرض الجميع' },
  manage_schedule: { en: 'Manage Schedule', ar: 'إدارة الجدول' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },

  // New: Landing enhancements
  stats_students_label: { en: 'Students', ar: 'طلاب' },
  stats_ustaadhs_label: { en: 'Ustaadhs', ar: 'معلمون' },
  stats_countries_label: { en: 'Countries', ar: 'دول' },

  trust_heading: { en: 'Trusted by learners worldwide', ar: 'موثوق من المتعلمين حول العالم' },
  trust_subheading: { en: 'Secure payments, verified teachers, and 24/7 support', ar: 'مدفوعات آمنة، معلمون موثوقون، ودعم على مدار الساعة' },

  how_heading: { en: 'How it works', ar: 'كيف تعمل المنصة' },
  how_step1_title: { en: 'Browse verified Ustaadhs', ar: 'تصفح المعلمين الموثوقين' },
  how_step1_description: { en: 'Filter by expertise, language, and availability', ar: 'فلتر حسب التخصص واللغة والتوفر' },
  how_step2_title: { en: 'Book your schedule', ar: 'احجز جدولك' },
  how_step2_description: { en: 'Pick times that match your routine', ar: 'اختر الأوقات التي تناسب روتينك' },
  how_step3_title: { en: 'Learn and progress', ar: 'تعلّم وتقدم' },
  how_step3_description: { en: '1:1 sessions with clear goals and materials', ar: 'جلسات فردية بأهداف واضحة ومواد تعليمية' },

  testimonials_heading: { en: 'What students say', ar: 'ماذا يقول الطلاب' },
  testimonial_1_quote: { en: 'My Tajweed improved drastically within weeks.', ar: 'تحسن تجويدي بشكل كبير خلال أسابيع.' },
  testimonial_1_name: { en: 'Sarah A.', ar: 'سارة أ.' },
  testimonial_1_country: { en: 'Canada', ar: 'كندا' },
  testimonial_2_quote: { en: 'Flexible timings and excellent teachers.', ar: 'أوقات مرنة ومعلمون مم��ازون.' },
  testimonial_2_name: { en: 'Omar R.', ar: 'عمر ر.' },
  testimonial_2_country: { en: 'UAE', ar: 'الإمارات' },

  // Landing search
  search_heading: { en: 'Find an Ustaadh', ar: 'ابحث عن معلم' },
  search_placeholder: { en: 'Search by name or specialty…', ar: 'ابحث بالاسم أو التخصص…' },
  browse_all_ustaadhs: { en: 'Browse all Ustaadhs', ar: 'تصفح جميع المعلمين' },

  // Footer
  footer_about_heading: { en: 'About', ar: 'نبذة' },
  footer_quick_links: { en: 'Quick Links', ar: 'روابط سريعة' },
  footer_contact_heading: { en: 'Contact', ar: 'تواصل' },
  footer_rights: { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
} satisfies Dict;

export type TranslationKey = keyof typeof strings;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  hasKey: (key: string) => key is TranslationKey;
}

const I18nContext = createContext<I18nCtx | null>(null);

const STORAGE_KEY = 'al-abraar-lang';

const getStoredLanguage = (): Lang => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'ar' ? 'ar' : 'en';
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(getStoredLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const translate = useCallback(
    (key: TranslationKey, fallback?: string) => {
      const entry = strings[key];
      if (!entry) {
        return fallback ?? key;
      }

      return entry[lang] ?? entry.en ?? fallback ?? key;
    },
    [lang]
  );

  const hasTranslationKey = useCallback((key: string): key is TranslationKey => key in strings, []);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: translate,
      hasKey: hasTranslationKey,
    }),
    [lang, translate, hasTranslationKey]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
