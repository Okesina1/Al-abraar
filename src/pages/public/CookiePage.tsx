import React from 'react';
import { Cookie } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';

export const CookiePage: React.FC = () => {
  const { lang } = useI18n();
  const c = COOKIE_CONTENT[lang];
  const updated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="bg-white">
      <header className="bg-gradient-to-br from-green-50 to-amber-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center"><Cookie className="h-6 w-6 text-white"/></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{c.title}</h1>
          </div>
          <p className="text-gray-600">{c.lastUpdated}: {updated}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 leading-relaxed text-gray-800">
        <section id="what-are-cookies" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.what.title}</h2>
          <p>
            {c.sections.what.p1}
          </p>
        </section>

        <section id="ethical-use" className="space-y-4 rounded-xl border border-green-100 bg-green-50/60 p-6">
          <h3 className="text-xl font-semibold text-green-900">{c.sections.ethics.title}</h3>
          <p>
            {c.sections.ethics.p1}
          </p>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              {c.sections.ethics.q1}
            </blockquote>
            <figcaption className="text-sm text-gray-600">{c.sections.ethics.q1ref}</figcaption>
          </figure>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              {c.sections.ethics.q2}
            </blockquote>
            <figcaption className="text-sm text-gray-600">{c.sections.ethics.q2ref}</figcaption>
          </figure>
        </section>

        <section id="how-we-use-cookies" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.use.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-semibold">{c.sections.use.items[0].label}</span> {c.sections.use.items[0].text}</li>
            <li><span className="font-semibold">{c.sections.use.items[1].label}</span> {c.sections.use.items[1].text}</li>
            <li><span className="font-semibold">{c.sections.use.items[2].label}</span> {c.sections.use.items[2].text}</li>
            <li><span className="font-semibold">{c.sections.use.items[3].label}</span> {c.sections.use.items[3].text}</li>
            <li><span className="font-semibold">{c.sections.use.items[4].label}</span> {c.sections.use.items[4].text}</li>
          </ul>
        </section>

        <section id="third-party-cookies" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.third.title}</h2>
          <p>
            {c.sections.third.p1}
          </p>
        </section>

        <section id="your-choices" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.choices.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.choices.items[0]}</li>
            <li>{c.sections.choices.items[1]}</li>
            <li>{c.sections.choices.items[2]}</li>
          </ul>
        </section>

        <section id="dnt" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.dnt.title}</h2>
          <p>
            {c.sections.dnt.p1}
          </p>
        </section>

        <section id="changes" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.changes.title}</h2>
          <p>
            {c.sections.changes.p1}
          </p>
        </section>

        <section id="contact" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.contact.title}</h2>
          <p>
            {c.sections.contact.p1}
          </p>
        </section>
      </div>
    </main>
  );
};

const COOKIE_CONTENT = {
  enCommon: { lastUpdated: "Last updated" },
  arCommon: { lastUpdated: "آخر تحديث" },
  en: {
    lastUpdated: "Last updated",
    title: "Cookie Policy",
    sections: {
      what: {
        title: "1. What Are Cookies?",
        p1: "Cookies are small text files stored on your device when you visit a website. They help sites function properly, remember preferences, and understand how you interact with content.",
      },
      ethics: {
        title: "Transparency with Taqwa (God‑Consciousness)",
        p1: "We aim to collect and utilize data in a manner aligned with God‑conscious accountability. Every digital interaction is treated as a trust, so we explain our use of cookies with clarity and honesty.",
        q1: "“And do not pursue that of which you have no knowledge. Indeed, the hearing, the sight, and the heart—about all those [one] will be questioned.”",
        q1ref: "Qur'an 17:36",
        q2: "“There should be neither harm nor reciprocating harm.”",
        q2ref: "Prophet Muhammad ﷺ, Sunan Ibn Majah 2341",
      },
      use: {
        title: "2. How We Use Cookies",
        items: [
          {
            label: "Essential Cookies:",
            text: "required for core functionality (e.g., authentication, security).",
          },
          {
            label: "Performance Cookies:",
            text: "analyze site usage to improve performance and features.",
          },
          {
            label: "Functionality Cookies:",
            text: "remember preferences such as language or display settings.",
          },
          {
            label: "Analytics Cookies:",
            text: "provide aggregated insights into traffic and user interactions.",
          },
          {
            label: "Advertising Cookies:",
            text: "may deliver relevant ads (if applicable) and measure effectiveness.",
          },
        ],
      },
      third: {
        title: "3. Third‑Party Cookies",
        p1: "We may allow trusted partners to set cookies for analytics, advertising, or other services. These third parties are responsible for their own cookie practices.",
      },
      choices: {
        title: "4. Your Choices",
        items: [
          "Manage or delete cookies in your browser settings.",
          "Opt out of certain analytics/advertising cookies via third‑party tools, where available.",
          "Blocking some cookies may impact site functionality.",
        ],
      },
      dnt: {
        title: "5. Do Not Track",
        p1: "Some browsers offer a “Do Not Track” (DNT) setting. Currently, we do not respond to DNT signals. We will update this Policy if our practices change.",
      },
      changes: {
        title: "6. Changes to this Policy",
        p1: "We may update this Policy to reflect changes in technology, law, or our practices. Please review this page periodically. Continued use indicates acceptance of changes.",
      },
      contact: {
        title: "7. Contact Us",
        p1: "For questions about this Cookie Policy, contact us at alabraaracademy.ng@gmail.com.",
      },
    },
  },
  ar: {
    lastUpdated: "آخر تحديث",
    title: "سياسة ملفات تعريف الارتباط",
    sections: {
      what: {
        title: "1. ما هي الكوكيز؟",
        p1: "الكوكيز ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقع. تساعد المواقع على العمل بشكل صحيح وتذكر التفضيلات وفهم تفاعلك مع المحتوى.",
      },
      ethics: {
        title: "الشفافية مع التقوى",
        p1: "نحرص على جمع البيانات واستخد��مها بما يوافق التقوى والمساءلة. كل تفاعل رقمي أمانة، لذا نشرح استعمالنا للكوكيز بوضوح وصدق.",
        q1: "﴿وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَٰئِكَ كَانَ عَنْهُ مَسْئُولًا﴾",
        q1ref: "القرآن 17:36",
        q2: '"لا ضرر ولا ضرار"',
        q2ref: "النبي ﷺ، سنن ابن ماجه 2341",
      },
      use: {
        title: "2. كيف نستخدم الكوكيز",
        items: [
          {
            label: "كوكيز أساسية:",
            text: "مطلوبة لوظائف أساسية (مثل التوثيق والأمان).",
          },
          {
            label: "كوكيز الأداء:",
            text: "لتحليل استخدام الموقع وتحسين الأداء والميزات.",
          },
          {
            label: "كوكيز الوظائف:",
            text: "لتذكر التفضيلات مثل اللغة أو إعدادات العرض.",
          },
          {
            label: "كوكيز التحليلات:",
            text: "لتقديم رؤى مجمعة حول الزيارات وتفاعلات المستخدم.",
          },
          {
            label: "كوكيز الإعلانات:",
            text: "قد تُستخدم لتقديم إ��لانات مناسبة (إن وُجدت) وقياس فعاليتها.",
          },
        ],
      },
      third: {
        title: "3. كوكيز الطرف الثالث",
        p1: "قد نسمح لشركاء موثوقين بوضع كوكيز لأغراض التحليلات أو الإعلانات أو خدمات أخرى. يتحمل هؤلاء الأطراف مسؤولية ممارساتهم بشأن الكوكيز.",
      },
      choices: {
        title: "4. خياراتك",
        items: [
          "إدارة أو حذف الكوكيز من إعدادات المتصفح.",
          "إلغاء بعض كوكيز التحليلات/الإعلانات عبر أدوات طرف ثالث حيثما أمكن.",
          "قد يؤثر حظر بعض الكوكيز على وظائف الموقع.",
        ],
      },
      dnt: {
        title: "5. عدم التتبع",
        p1: 'توفّر بعض المتصفحات إعداد "عدم التتبع" (DNT). حاليًا لا نستجيب لإشارات DNT. سنحدّث هذه السياسة إذا تغيّرت ممارساتنا.',
      },
      changes: {
        title: "6. تغييرات على هذه السياسة",
        p1: "قد نحدّث هذه السياسة لتواكب التقنية أو القانون أو ممارساتنا. يُرجى مراجعة هذه الصفحة دوريًا. استمرارك في الاستخدام يعني قبولك أي تغييرات.",
      },
      contact: {
        title: "7. تواصل معنا",
        p1: "للاستفسارات حول سياسة الكوكيز: alabraaracademy.ng@gmail.com.",
      },
    },
  },
} as const;

export default CookiePage;
