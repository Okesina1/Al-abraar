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
  feature_quality_title: { en: 'Quality Education', ar: 'تعليم ذو ��ودة' },
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

  trust_heading: { en: 'Trusted by learners worldwide', ar: 'موثوق ��ن المتعلمين حول العالم' },
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

  /* Landing v2 - Hero */
  hero_trust_badge: { en: 'Trusted by 10,000+ students worldwide', ar: 'موثوق من قِبل أكثر من 10,000 طالب حول العالم' },
  hero_title_prefix: { en: 'Learn the', ar: 'تعلّم' },
  hero_title_highlight_v2: { en: "Qur'an & Arabic", ar: 'القرآن واللغة العربية' },
  hero_title_suffix: { en: 'with Expert Teachers', ar: 'مع معلمين خ��راء' },
  hero_description_v2: {
    en: 'One-to-one lessons with verified scholars. Flexible schedules, clear progress, and tailored materials.',
    ar: 'دروس فردية مع علماء موثوقين. جداول مرنة، تقدم واضح، ومواد تعليمية مخصصة.',
  },
  cta_start_learning: { en: 'Start Learning Today', ar: 'ابدأ التعلم اليوم' },
  cta_watch_demo: { en: 'Watch Demo', ar: 'مشاهدة العرض' },
  stats_active_students: { en: 'Active Students', ar: 'طلاب نشطون' },
  stats_expert_teachers: { en: 'Expert Teachers', ar: 'معلمون خبراء' },
  stats_countries: { en: 'Countries', ar: 'دول' },

  /* Landing v2 - Why choose */
  why_choose_subheading: {
    en: 'Experience the future of Islamic education with our innovative platform designed for modern learners',
    ar: 'اختبر مستقبل التعليم الإسلامي عبر منصتنا المبتكرة المصممة للمتعلمين المعاصرين',
  },
  feature_verified_excellence_title: { en: 'Verified Excellence', ar: 'تميّز موثّق' },
  feature_verified_excellence_description: {
    en: 'Every teacher undergoes rigorous verification. Learn from certified scholars with proven expertise in Islamic studies and pedagogy.',
    ar: 'يخضع كل مع��م لعملية تحقق صارمة. تعلّم مع علماء معتمدين ذوي خبرة مثبتة في العلوم الإسلامية وطرق التدريس.',
  },
  feature_flexible_learning_title: { en: 'Flexible Learning', ar: 'تعلّم مرن' },
  feature_flexible_learning_description: {
    en: 'Schedule lessons that fit your lifestyle. Our smart booking system adapts to your timezone and preferences seamlessly.',
    ar: 'حدّد دروسك بما يناسب نمط حياتك. يتكيّف نظام الحجز الذكي لدينا مع منطقتك الزمنية وتفضيلاتك بسلاسة.',
  },
  feature_global_community_title: { en: 'Global Community', ar: 'مجتمع عالمي' },
  feature_global_community_description: {
    en: 'Join a worldwide community of learners. Connect with teachers and students from over 40 countries around the globe.',
    ar: 'انضمّ إلى مجتمع عالمي من المتعلمين. تواصل مع معلمين وطلاب من أكثر من 40 دولة حول العالم.',
  },
  feature_learn_more: { en: 'Learn more', ar: 'اعرف المزيد' },
  feature_explore_scheduling: { en: 'Explore scheduling', ar: 'استكشف الجدولة' },
  feature_join_community: { en: 'Join community', ar: 'انضم إلى المجتمع' },

  /* Landing v2 - Packages */
  packages_heading_v2: { en: 'Choose Your Learning Path', ar: 'اختر مسارك التعليمي' },
  packages_subheading_v2: {
    en: 'Flexible packages designed to meet your Islamic education goals, from beginner to advanced levels',
    ar: 'باقات مرنة مصممة لتلبية أهدافك في التعليم الإسلامي من المبتدئ إلى المتقدم',
  },
  packages_foundation_label: { en: 'Foundation Package', ar: 'باقة الأساس' },
  packages_comprehensive_label: { en: 'Comprehensive Package', ar: 'باقة شاملة' },
  per_hour: { en: 'per hour', ar: 'لكل ساعة' },
  packages_start_foundation: { en: 'Start with Foundation', ar: 'ابدأ بالأساس' },
  packages_choose_complete: { en: 'Choose Complete Package', ar: 'اختر الباقة الشاملة' },
  pkg_quran_b1: { en: 'Qur\'an recitation with proper pronunciation', ar: 'تلاوة القرآن بالنطق الصحيح' },
  pkg_quran_b2: { en: 'Tajweed rules and application', ar: 'قواعد التجويد وتطبيقها' },
  pkg_quran_b3: { en: 'Personalized feedback and correction', ar: 'ملاحظات شخصية وتصحيح' },
  pkg_quran_b4: { en: 'Progress tracking and assessments', ar: 'متابعة التقدم والتقييمات' },
  pkg_complete_b1: { en: 'Everything in Foundation Package', ar: 'كل ما في باقة الأساس' },
  pkg_complete_b2: { en: 'Hadeeth studies and interpretation', ar: 'دراسة الحديث وتفسيره' },
  pkg_complete_b3: { en: 'Arabic language mastery', ar: 'إتقان اللغة العربية' },
  pkg_complete_b4: { en: 'Islamic history and culture', ar: 'التاريخ والثقافة الإسلامية' },
  pkg_complete_b5: { en: 'Priority support and materials', ar: 'دعم ومواد أولوية' },

  /* Landing v2 - How it works */
  how_heading_v2: { en: 'Your Learning Journey in 3 Simple Steps', ar: 'رحلتك التعليمية في 3 خطوات بسيطة' },
  how_subheading_v2: {
    en: "From browsing teachers to mastering Islamic knowledge - we've made it beautifully simple",
    ar: 'من تصفح المعلمين إلى إتقان العلوم الإسلامية - جعلناها سهلة وجميلة',
  },

  /* Landing v2 - Teachers */
  teachers_heading: { en: 'Meet Our Expert Teachers', ar: 'تعرّف على معلمينا الخبراء' },
  teachers_subheading: { en: 'Learn from the best Islamic scholars and educators from around the world', ar: 'تعلّم من أفضل العلماء والمربين الإسلاميين من حول العالم' },

  /* Landing v2 - Testimonials */
  testimonials_heading_v2: { en: 'Loved by Students Worldwide', ar: 'محبوب من الطلاب حول العالم' },
  testimonials_subheading: { en: 'Join thousands of satisfied learners who have transformed their Islamic knowledge with Al-Abraar', ar: 'انضم إلى آلاف المتعلمين الراضين الذين طوروا معارفهم الإسلامية مع البراء' },
  testimonial_3_quote: { en: 'As a busy professional, the scheduling flexibility and quality of teaching allowed me to continue my Islamic education seamlessly.', ar: 'بصفتي محترفًا مشغولًا، سمح لي مرونة الجدولة وجودة التعليم بمواصلة تعليمي الإسلامي بسلاسة.' },
  student_from_canada: { en: 'Student from Canada', ar: 'طالبة من كندا' },
  student_from_uae: { en: 'Student from UAE', ar: 'طالب من الإمارات' },
  student_from_malaysia: { en: 'Student from Malaysia', ar: 'طالبة من ماليزيا' },

  /* Landing v2 - Trust */
  trust_heading_v2: { en: 'Built on Trust & Excellence', ar: 'مبني على الثقة والتميّز' },
  trust_subheading_v2: { en: 'Your security and learning experience are our top priorities', ar: 'أمانك وتجربتك التعليمية هما أولويتنا القصوى' },
  trust_secure_payments: { en: 'Secure Payments', ar: 'مدفوعات آمنة' },
  trust_secure_payments_desc: { en: 'Bank-level encryption with Stripe', ar: 'تشفير بمستوى البنوك عبر سترايب' },
  trust_certified_teachers: { en: 'Certified Teachers', ar: 'معلمون معتمدون' },
  trust_certified_teachers_desc: { en: 'Verified credentials and experience', ar: 'اعتمادات وخبرة موثوقة' },
  trust_247_support: { en: '24/7 Support', ar: 'دعم 24/7' },
  trust_247_support_desc: { en: 'Always here to help you succeed', ar: 'دائمًا هنا لمساعدتك على النجاح' },
  trust_progress_tracking: { en: 'Progress Tracking', ar: 'تتبّع التقدم' },
  trust_progress_tracking_desc: { en: 'Monitor your learning journey', ar: 'راقب رحلتك التعليمية' },

  /* Landing v2 - Final CTA */
  cta_badge_text: { en: 'Join 10,000+ students already learning', ar: 'انضم إلى أكثر من 10,000 طالب يتعلمون بالفعل' },
  cta_paragraph_v2: { en: 'Start today with a free consultation and discover how our personalized approach can transform your understanding of Islamic knowledge.', ar: 'ابدأ اليوم باستشارة مجانية واكتشف كيف يمكن لنهجنا المخصص أن يغيّر فهمك للعل��م الإسلامية.' },
  cta_get_started_free: { en: 'Get Started Free', ar: 'ابدأ مجانًا' },
  cta_book_consultation: { en: 'Book a Consultation', ar: 'احجز استشارة' },
  avg_rating: { en: 'Average Rating', ar: 'متوسط التقييم' },
  lessons_completed: { en: 'Lessons Completed', ar: 'دروس مكتملة' },
  success_rate: { en: 'Success Rate', ar: 'معدل النجاح' },
  support_available: { en: 'Support Available', ar: 'الدعم متاح' },

  /* Footer extras */
  footer_brand_blurb: { en: 'Empowering Muslims worldwide with authentic Islamic education through verified teachers and modern technology.', ar: 'نُمكِّن المسلمين حول العالم من التعليم الإسلامي الأصيل عبر معلمين موثوقين وتقنية حديثة.' },
  badge_verified_teachers: { en: 'Verified Teachers', ar: 'معلمون موثوقون' },
  badge_secure_platform: { en: 'Secure Platform', ar: 'منصة آمنة' },
  link_browse_teachers: { en: 'Browse Teachers', ar: 'تصفح المعلمين' },
  link_sign_up: { en: 'Sign Up', ar: 'إنشاء حساب' },
  link_sign_in: { en: 'Sign In', ar: 'تسجيل الدخول' },
  link_how_it_works: { en: 'How it Works', ar: 'كيف تعمل المنصة' },
  footer_available_247: { en: 'Available 24/7', ar: 'متاح على مدار الساعة' },
  terms_of_service: { en: 'Terms of Service', ar: 'شروط الخدمة' },
  privacy_policy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  cookie_policy: { en: 'Cookie Policy', ar: 'سياسة ملفات تعريف الارتباط' },
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
