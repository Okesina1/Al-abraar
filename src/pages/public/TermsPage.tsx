import React from 'react';
import { BookOpen } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';

export const TermsPage: React.FC = () => {
  const { lang } = useI18n();
  const c = TERMS_CONTENT[lang];
  const updated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="bg-white">
      <header className="bg-gradient-to-br from-green-50 to-amber-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center"><BookOpen className="h-6 w-6 text-white"/></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{c.title}</h1>
          </div>
          <p className="text-gray-600">{c.lastUpdated}: {updated}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 leading-relaxed text-gray-800">
        <section id="introduction" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.intro.title}</h2>
          <p>
            {c.sections.intro.p1}
          </p>
        </section>

        <section id="spiritual-foundation" className="space-y-4 rounded-xl border border-green-100 bg-green-50/60 p-6">
          <h3 className="text-xl font-semibold text-green-900">{c.sections.spiritual.title}</h3>
          <p>
            {c.sections.spiritual.p1}
          </p>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              {c.sections.spiritual.q1}
            </blockquote>
            <figcaption className="text-sm text-gray-600">{c.sections.spiritual.q1ref}</figcaption>
          </figure>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              {c.sections.spiritual.q2}
            </blockquote>
            <figcaption className="text-sm text-gray-600">{c.sections.spiritual.q2ref}</figcaption>
          </figure>
        </section>

        <section id="eligibility" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.eligibility.title}</h2>
          <p>
            {c.sections.eligibility.p1}
          </p>
        </section>

        <section id="accounts" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.accounts.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.accounts.items[0]}</li>
            <li>{c.sections.accounts.items[1]}</li>
            <li>{c.sections.accounts.items[2]}</li>
          </ul>
        </section>

        <section id="bookings-payments" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.bookings.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.bookings.items[0]}</li>
            <li>{c.sections.bookings.items[1]}</li>
            <li>{c.sections.bookings.items[2]}</li>
            <li>{c.sections.bookings.items[3]}</li>
          </ul>
        </section>

        <section id="cancellations" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.cancellations.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.cancellations.items[0]}</li>
            <li>{c.sections.cancellations.items[1]}</li>
          </ul>
        </section>

        <section id="teacher-obligations" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.teacher.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.teacher.items[0]}</li>
            <li>{c.sections.teacher.items[1]}</li>
            <li>{c.sections.teacher.items[2]}</li>
          </ul>
        </section>

        <section id="student-obligations" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.student.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.student.items[0]}</li>
            <li>{c.sections.student.items[1]}</li>
          </ul>
        </section>

        <section id="acceptable-use" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.use.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.use.items[0]}</li>
            <li>{c.sections.use.items[1]}</li>
            <li>{c.sections.use.items[2]}</li>
            <li>{c.sections.use.items[3]}</li>
          </ul>
        </section>

        <section id="ip" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.ip.title}</h2>
          <p>
            {c.sections.ip.p1}
          </p>
        </section>

        <section id="disclaimers" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.disclaimers.title}</h2>
          <p>
            {c.sections.disclaimers.p1}
          </p>
        </section>

        <section id="liability" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.liability.title}</h2>
          <p>
            {c.sections.liability.p1}
          </p>
        </section>

        <section id="indemnity" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.indemnity.title}</h2>
          <p>
            {c.sections.indemnity.p1}
          </p>
        </section>

        <section id="law" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.law.title}</h2>
          <p>
            {c.sections.law.p1}
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

const TERMS_CONTENT = {
  enCommon: { lastUpdated: 'Last updated' },
  arCommon: { lastUpdated: 'آخر تحديث' },
  en: {
    lastUpdated: 'Last updated',
    title: 'Terms of Service',
    sections: {
      intro: { title: '1. Introduction', p1: 'Welcome to Al‑Abraar. These Terms of Service (the “Terms”) govern your access to and use of our platform, websites, mobile services, and any related services (collectively, the “Services”). By creating an account, accessing, or using the Services, you agree to be bound by these Terms and our Privacy Policy.' },
      spiritual: {
        title: 'Guided by Sacred Teachings',
        p1: "Our commitment to transparent agreements and respectful conduct is rooted in the Qur'an and the Sunnah. We encourage every member of the Al‑Abraar community to honor their pledges and uphold justice in every interaction on our platform.",
        q1: '“And fulfill the covenant of Allah when you have taken it, and do not break oaths after confirming them while you have made Allah, over you, a witness.”',
        q1ref: "Qur'an 16:91",
        q2: '“The Muslims are bound by their conditions, except a condition that makes the lawful unlawful or the unlawful lawful.”',
        q2ref: 'Prophet Muhammad ﷺ, Sunan Abi Dawud 3594',
      },
      eligibility: { title: '2. Eligibility', p1: 'You must be at least the age of legal majority in your jurisdiction, or have verifiable consent from a parent or legal guardian, to use the Services. By using the Services, you represent and warrant that you meet these requirements and that the information you provide is accurate and complete.' },
      accounts: { title: '3. Accounts and Security', items: [ 'You are responsible for maintaining the confidentiality of your account credentials.', 'You agree to notify us immediately of any unauthorized use of your account.', 'We may suspend or terminate accounts that violate these Terms or pose security risks.' ] },
      bookings: { title: '4. Bookings, Payments, and Refunds', items: [ 'Students may book lessons with teachers (“Ustaadhs”) according to availability displayed on the platform.', 'Payments are processed securely by our payment partners (e.g., Stripe). Additional fees and taxes may apply.', 'Refunds are assessed in good faith per our policies and applicable law. Certain fees may be non‑refundable.', 'No cash handling is permitted outside the platform for booked lessons.' ] },
      cancellations: { title: '5. Cancellations and Rescheduling', items: [ 'Students and teachers should cancel or reschedule within the platform, subject to posted deadlines.', 'Late cancellations or no‑shows may incur charges or affect account standing.' ] },
      teacher: { title: '6. Teacher Obligations', items: [ 'Teachers must provide accurate profile information and maintain professional conduct at all times.', 'Teachers may not solicit off‑platform payments or communications that bypass the Service.', 'Teachers are responsible for complying with local laws, tax obligations, and necessary certifications.' ] },
      student: { title: '7. Student Obligations', items: [ 'Students must provide accurate information and respect teacher availability and policies.', 'Students agree not to record, distribute, or share lesson materials without permission.' ] },
      use: { title: '8. Acceptable Use and Prohibited Conduct', items: [ 'No harassment, hate speech, or abusive behavior.', 'No infringement of intellectual property or privacy rights.', 'No malware, hacking, scraping, or unauthorized automated access.', 'No content that violates applicable laws or community standards.' ] },
      ip: { title: '9. Intellectual Property', p1: 'The Services, including all content, software, and trademarks, are owned by or licensed to Al‑Abraar and are protected by intellectual property laws. You may not use our marks or content without prior written consent.' },
      disclaimers: { title: '10. Disclaimers', p1: 'The Services are provided “as is” and “as available.” We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non‑infringement. We do not guarantee uninterrupted or error‑free operation.' },
      liability: { title: '11. Limitation of Liability', p1: 'To the fullest extent permitted by law, Al‑Abraar will not be liable for any indirect, incidental, special, consequential, or punitive damages; or for lost profits, revenues, data, or goodwill arising from your use of or inability to use the Services.' },
      indemnity: { title: '12. Indemnification', p1: 'You agree to indemnify and hold harmless Al‑Abraar and its affiliates from any claims, liabilities, damages, losses, and expenses, including legal fees, arising out of or related to your use of the Services or violation of these Terms.' },
      law: { title: '13. Governing Law and Dispute Resolution', p1: 'These Terms are governed by the laws of the jurisdiction where Al‑Abraar is established, without regard to conflict of law principles. Disputes will be resolved through good‑faith negotiations; if unresolved, they shall be submitted to the competent courts of that jurisdiction.' },
      changes: { title: '14. Changes to the Terms', p1: 'We may modify these Terms from time to time. Material changes will be posted on this page with a new “Last updated” date. Your continued use of the Services constitutes acceptance of the revised Terms.' },
      contact: { title: '15. Contact', p1: 'If you have any questions about these Terms, please contact us at support@al‑abraar.com.' },
    },
  },
  ar: {
    lastUpdated: 'آخر تحديث',
    title: 'شروط الخدمة',
    sections: {
      intro: { title: '1. مقدمة', p1: 'مرحبًا بك في البراء. تحكم هذه الشروط وصولك إلى منصتنا وخدماتنا (المواقع والتطبيقات والخدمات ذات الصلة). باستخدامك للخدمات أو إنشاء حساب فإنك توافق على هذه الشروط وسياسة الخصوصية.' },
      spiritual: {
        title: 'مستندون إلى التعاليم الشرعية',
        p1: 'التزامنا بالشفافية واحترام التعاملات منبثق من القرآن والسنة. ونحث كل أفراد مجتمع البراء على الوفاء بالعهود وإقامة العدل في كل تفاعل على منصتنا.',
        q1: '﴿وَأَوْفُوا بِعَهْد�� اللَّهِ إِذَا عَاهَدْتُمْ وَلَا تَنْقُضُوا الْأَيْمَانَ بَعْدَ تَوْكِيدِهَا وَقَدْ جَعَلْتُمُ اللَّهَ عَلَيْكُمْ كَفِيلًا﴾',
        q1ref: 'القرآن 16:91',
        q2: '"المسلمون على شروطهم، إلا شرطًا أحلّ حرامًا أو حرّم حلالًا"',
        q2ref: 'النبي ﷺ، سنن أبي داود 3594',
      },
      eligibility: { title: '2. الأهلية', p1: 'يجب أن تكون بسن الرشد القانوني في بلدك أو تمتلك موافقة موثقة من ولي الأمر. باستخدامك للخدمات فإنك تقرّ بتوفر الشروط ودقة معلوماتك.' },
      accounts: { title: '3. الحسابات والأمان', items: [ 'أنت مسؤول عن سرية بيانات الدخول لحسابك.', 'أبلغنا فورًا عن أي استخدام غير مصرح به لحسابك.', 'يجوز لنا إيقاف أو إنهاء الحسابات المخالفة أو ذات المخاطر الأمنية.' ] },
      bookings: { title: '4. الحجوزات والمدفوعات والاسترداد', items: [ 'يجوز للطلاب حجز الدروس مع المعلمين وفق التوفر على المنصة.', 'ت��عالج المدفوعات بأمان عبر مزودي الدفع (مثل سترايب). قد تُطبق رسوم وضرائب إضافية.', 'يخضع الاسترداد لسياساتنا والقانو�� المعمول به. قد تكون بعض الرسوم غير قابلة للاسترداد.', 'لا يُسمح بالتعاملات النقدية خارج المنصة للدروس المحجوزة.' ] },
      cancellations: { title: '5. الإلغاء وإعادة الجدولة', items: [ 'يجب إجراء الإلغاء أو إعادة الجدولة عبر المنصة وضمن المهل المحددة.', 'قد تؤثر الإلغاءات المتأخرة أو عدم الحضور على الرسوم أو حالة الحساب.' ] },
      teacher: { title: '6. التزامات المعلم', items: [ 'يلتزم المعلمون بدقة البيانات والسلوك المهني دائمًا.', 'لا يجوز استدراج مدفوعات أو تواصل خارج المنصة.', 'يلتزم المعلمون بالقوانين المحلية والضرائب والشهادات اللازمة.' ] },
      student: { title: '7. التزامات الطالب', items: [ 'يلتزم الطلاب بدقة المعلومات واحترام سياسات وتوفر المعلم.', 'لا يجوز تسجيل أو نشر أو مشاركة مواد الدروس بدون إذن.' ] },
      use: { title: '8. الاستخدام المقبول والمحظور', items: [ 'يُمنع التحرش وخطاب الكرا��ية والسلوك المسيء.', 'يُمنع انتهاك الملكية الفكرية أو الخصوصية.', 'يُمنع البرمجيات الخبيثة والاختراق والكشط والوصول الآلي غير المصرح.', 'يُمنع أي محتوى يخالف القوانين أو المعايير المجتمعية.' ] },
      ip: { title: '9. الملكية الفكرية', p1: 'تعود ملكية الخدمات ومحتواها وبرمجياتها وعلاماتها أو تُرخص للبراء ومحميّة بقوانين الملكية الفكرية. لا يجوز استخدام العلامات أو المحتوى دون إذن خطي مسبق.' },
      disclaimers: { title: '10. إخلاء المسؤولية', p1: 'تُقدَّم الخدمات "كما هي" و"حسب المتاح" دون أي ضمانات صريحة أو ضمنية، بما فيها الملاءمة لغرض معيّن وعدم الانتهاك. لا نضمن عملًا دون انقطاع أو أخطاء.' },
      liability: { title: '11. تحديد المسؤولية', p1: 'ضمن الحدود التي يسمح بها القانون، لا تتحمل البراء أي أضرار غير مباشرة أو خاصة أو تبعية أو عقابية، ولا خسائر الأرباح أو الإيرادات أو ا��بيانات أو السمعة نتيجة استخدامك للخدمات أو العجز عن استخدامها.' },
      indemnity: { title: '12. التعويض', p1: 'توافق على تعويض البراء وشركاتها التابعة عن أية مطالبات أو أضرار أو خسائر أو نفقات (بما في ذلك أتعاب المحاماة) الناشئة عن استخدامك للخدمات أو مخالفة الشروط.' },
      law: { title: '13. القانون والاختصاص', p1: 'تخضع هذه الشروط لقوانين بلد تأسيس البراء دون اعتبار لتنازع القوانين. تُحل النزاعات وديًا بحسن نية، وإن تعذّر تُعرض على المحاكم المختصة.' },
      changes: { title: '14. تغييرات على الشروط', p1: 'قد نُحدّث الشروط من وقت لآخر. تُنشر التغييرات الجوهرية هنا مع تاريخ "آخر تحديث" جديد. استمرارك في الاستخدام يعني قبولك الشروط المعدّلة.' },
      contact: { title: '15. تواصل', p1: 'للاستفسارات حول هذه الشروط راسلنا: support@al‑abraar.com.' },
    },
  },
} as const;

export default TermsPage;
