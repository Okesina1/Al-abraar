import React from 'react';
import { Shield } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';

export const PrivacyPage: React.FC = () => {
  const { lang } = useI18n();
  const c = PRIVACY_CONTENT[lang];
  const updated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="bg-white">
      <header className="bg-gradient-to-br from-green-50 to-amber-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center"><Shield className="h-6 w-6 text-white"/></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{c.title}</h1>
          </div>
          <p className="text-gray-600">Last updated: {updated}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 leading-relaxed text-gray-800">
        <section id="overview" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.overview.title}</h2>
          <p>
            {c.sections.overview.p1}
          </p>
        </section>

        <section id="privacy-ethic" className="space-y-4 rounded-xl border border-green-100 bg-green-50/60 p-6">
          <h3 className="text-xl font-semibold text-green-900">{c.sections.ethic.title}</h3>
          <p>
            {c.sections.ethic.p1}
          </p>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              {c.sections.ethic.q1}
            </blockquote>
            <figcaption className="text-sm text-gray-600">{c.sections.ethic.q1ref}</figcaption>
          </figure>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              {c.sections.ethic.q2}
            </blockquote>
            <figcaption className="text-sm text-gray-600">{c.sections.ethic.q2ref}</figcaption>
          </figure>
        </section>

        <section id="data-we-collect" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.collect.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-semibold">{c.sections.collect.items[0].label}</span> {c.sections.collect.items[0].text}</li>
            <li><span className="font-semibold">{c.sections.collect.items[1].label}</span> {c.sections.collect.items[1].text}</li>
            <li><span className="font-semibold">{c.sections.collect.items[2].label}</span> {c.sections.collect.items[2].text}</li>
            <li><span className="font-semibold">{c.sections.collect.items[3].label}</span> {c.sections.collect.items[3].text}</li>
            <li><span className="font-semibold">{c.sections.collect.items[4].label}</span> {c.sections.collect.items[4].text}</li>
          </ul>
        </section>

        <section id="how-we-use" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.use.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.use.items[0]}</li>
            <li>{c.sections.use.items[1]}</li>
            <li>{c.sections.use.items[2]}</li>
            <li>{c.sections.use.items[3]}</li>
            <li>{c.sections.use.items[4]}</li>
          </ul>
        </section>

        <section id="legal-bases" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.bases.title}</h2>
          <p>
            {c.sections.bases.p1}
          </p>
        </section>

        <section id="sharing" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.share.title}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.share.items[0]}</li>
            <li>{c.sections.share.items[1]}</li>
            <li>{c.sections.share.items[2]}</li>
            <li>{c.sections.share.items[3]}</li>
          </ul>
        </section>

        <section id="transfers" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.transfers.title}</h2>
          <p>
            {c.sections.transfers.p1}
          </p>
        </section>

        <section id="retention" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.retention.title}</h2>
          <p>
            {c.sections.retention.p1}
          </p>
        </section>

        <section id="your-rights" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.rights.title}</h2>
          <p>{c.sections.rights.p1}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{c.sections.rights.items[0]}</li>
            <li>{c.sections.rights.items[1]}</li>
            <li>{c.sections.rights.items[2]}</li>
            <li>{c.sections.rights.items[3]}</li>
          </ul>
        </section>

        <section id="children" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.children.title}</h2>
          <p>
            {c.sections.children.p1}
          </p>
        </section>

        <section id="security" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.security.title}</h2>
          <p>
            {c.sections.security.p1}
          </p>
        </section>

        <section id="third-parties" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{c.sections.thirdparty.title}</h2>
          <p>
            {c.sections.thirdparty.p1}
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

const PRIVACY_CONTENT = {
  en: {
    title: 'Privacy Policy',
    sections: {
      overview: { title: '1. Overview', p1: 'This Privacy Policy explains how Al‑Abraar collects, uses, discloses, and safeguards your information when you use our Services. By using the Services, you consent to the practices described in this Policy.' },
      ethic: {
        title: 'An Amanah (Trust) We Safeguard',
        p1: 'Respecting your privacy is more than a legal duty—it is a trust entrusted to us by Allah ﷻ and reinforced by the teachings of His Messenger ﷺ. We strive to prevent intrusive data practices and foster a safe learning environment grounded in compassion and integrity.',
        q1: '“O you who have believed, avoid much suspicion. Indeed, some suspicion is sin. And do not spy or backbite one another.”',
        q1ref: "Qur'an 49:12",
        q2: '“When a person tells you something and then leaves, it is a trust.”',
        q2ref: 'Prophet Muhammad ﷺ, Sunan Abi Dawud 4869',
      },
      collect: {
        title: '2. Information We Collect',
        items: [
          { label: 'Account Information:', text: 'name, email, password, role, profile details.' },
          { label: 'Booking and Payment Data:', text: 'schedule selections, payment metadata (processed by payment providers).'},
          { label: 'Communications:', text: 'messages, support requests, feedback.' },
          { label: 'Usage Data:', text: 'device, browser, pages viewed, actions taken, IP address, and approximate location.' },
          { label: 'Cookies and Similar Technologies:', text: 'as described in our Cookie Policy.' },
        ],
      },
      use: {
        title: '3. How We Use Information',
        items: [
          'Provide, secure, and improve the Services.',
          'Facilitate bookings, payments, and communications.',
          'Personalize content and recommend relevant teachers or materials.',
          'Comply with legal obligations and prevent fraud or abuse.',
          'Communicate with you about updates, security alerts, and support.',
        ],
      },
      bases: { title: '4. Legal Bases for Processing', p1: 'Where applicable (e.g., in the EEA/UK), we process personal data under legal bases including consent, contract performance, legitimate interests, legal obligations, and protection of vital interests.' },
      share: {
        title: '5. How We Share Information',
        items: [
          'With service providers (e.g., hosting, analytics, payment processing) under appropriate safeguards.',
          'With teachers and students as necessary to deliver the Services (e.g., booking details).',
          'For legal reasons, to protect rights, safety, and prevent harm or fraud.',
          'In connection with business transfers, subject to confidentiality and notice obligations.',
        ],
      },
      transfers: { title: '6. International Data Transfers', p1: 'We may transfer, store, and process information in countries other than your own. Where required, we use appropriate safeguards such as Standard Contractual Clauses.' },
      retention: { title: '7. Data Retention', p1: 'We retain personal data only as long as necessary to fulfill the purposes outlined in this Policy, comply with our legal obligations, resolve disputes, and enforce agreements.' },
      rights: {
        title: '8. Your Rights',
        p1: 'Depending on your location, your rights may include:',
        items: [
          'Access, correction, deletion, and portability of your data.',
          'Objection to or restriction of certain processing.',
          'Withdrawal of consent where processing is based on consent.',
          'Filing a complaint with your local data protection authority.',
        ],
      },
      children: { title: '9. Children’s Privacy', p1: 'Our Services are not directed to children under the age of 13 (or the age of consent in your jurisdiction). If you believe we have collected data from a child, please contact us to request deletion.' },
      security: { title: '10. Security', p1: 'We implement technical and organizational measures to protect your data; however, no method of transmission or storage is completely secure. We cannot guarantee absolute security.' },
      thirdparty: { title: '11. Third‑Party Links and Services', p1: 'Our Services may contain links to third‑party sites or services. We are not responsible for their privacy practices. We encourage you to review their policies.' },
      changes: { title: '12. Changes to this Policy', p1: 'We may update this Policy from time to time. Material changes will be posted on this page with a new “Last updated” date. Continued use of the Services indicates acceptance of the updated Policy.' },
      contact: { title: '13. Contact Us', p1: 'For privacy inquiries or to exercise your rights, contact us at privacy@al‑abraar.com.' },
    },
  },
  ar: {
    title: 'سياسة الخصوصية',
    sections: {
      overview: { title: '1. نظرة عامة', p1: 'توضح هذه السياسة كيفية جمع واستخدام والكشف عن معلوماتك وحمايتها عند استخدامك لخدماتنا. باستخدامك للخدمات، فإنك توافق على الممارسات الموضحة في هذه السياسة.' },
      ethic: {
        title: 'أمانة نحافظ عليها',
        p1: 'احترام خصوصيتك أكثر من مجرد واجب قانوني—إنها أمانة عند الله ﷻ ويعززها هدي النبي ﷺ. نسعى لمنع الممارسات المتطفلة وتهيئة بيئة تعلم آمنة قائمة على الرحمة والنزاهة.',
        q1: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ وَلَا تَجَسَّسُوا وَلَا يَغْتَبْ بَعْضُكُمْ بَعْضًا﴾',
        q1ref: 'القرآن 49:12',
        q2: '"إذا حدث الرجلُ الحديثَ ثم التفت فهي أمانة"',
        q2ref: 'النبي ﷺ، سنن أبي داود 4869',
      },
      collect: {
        title: '2. المعلومات التي نجمعها',
        items: [
          { label: 'معلومات الحساب:', text: 'الاسم، البريد الإلكتروني، كلمة المرور، الدور، تفاصيل الملف الشخصي.' },
          { label: 'بيانات الحجز والدفع:', text: 'اختيارات الجداول، وبيانات الدفع الوصفية (تُعالج لدى مزودي الدفع).' },
          { label: 'الاتصالات:', text: 'الرسائل وطلبات الدعم والتغذية الراجعة.' },
          { label: 'بيانات الاستخدام:', text: 'الجهاز والمتصفح والصفحات المعروضة والإجراءات المتخذة وعنوان IP والموقع التقريبي.' },
          { label: 'الكوكيز والتقنيات المماثلة:', text: 'كما هو موضح في سياسة الكوكيز.' },
        ],
      },
      use: {
        title: '3. كيف نستخدم المعلومات',
        items: [
          'تقديم الخدمات وتأمينها وتحسينها.',
          'تيسير الحجوزات والمدفوعات والاتصالات.',
          'تخصيص المحتوى واقتراح المعلمين أو المواد المناسبة.',
          'الامتثال للالتزامات القانونية ومنع الاحتيال أو الإساءة.',
          'التواصل بشأن التحديثات والتنبيهات الأمنية والدعم.',
        ],
      },
      bases: { title: '4. الأسس القانونية للمعالجة', p1: 'عند الاقتضاء (مثل المنطقة الاقتصادية الأوروبية/المملكة المتحدة) نعالج البيانات بناءً على أسس قانونية تشمل الموافقة وأداء العقد والمصالح المشروعة والالتزامات القانونية وحماية المصالح الحيوية.' },
      share: {
        title: '5. كيفية مشاركة المعلومات',
        items: [
          'مع مزودي الخدمات (الاستضافة، التحليلات، معالجة الدفع) ضمن ضمانات مناسبة.',
          'مع المعلمين والطلاب حسب الحاجة لتقديم الخدمات (مثل تفاصيل الحجز).',
          'لأسباب قانونية، لحماية الحقوق والسلامة ومنع الضرر أو الاحتيال.',
          'في سياق انتقالات الأعمال مع مراعاة السرية والإشعار.',
        ],
      },
      transfers: { title: '6. التحويلات الدولية للبيانات', p1: 'قد ننقل معلوماتك أو نخزنها أو نعالجها في دول غير دولتك. عند الحاجة نستخدم ضمانات مناسبة مثل البنود التعاقدية القياسية.' },
      retention: { title: '7. الاحتفاظ بالبيانات', p1: 'نحتفظ بالبيانات الشخصية فقط للمدة اللازمة لتحقيق الأغراض المذ��ورة في هذه السياسة والامتثال للالتزامات القانونية وحل النزاعات وتنفيذ الاتفاقيات.' },
      rights: {
        title: '8. حقوقك',
        p1: 'قد تشمل حقوقك—حسب موقعك—ما يلي:',
        items: [
          'الاطلاع على بياناتك وتصحيحها وحذفها ونقلها.',
          'الاعتراض على معالجات معينة أو تقييدها.',
          'سحب الموافقة حيثما كانت المعالجة مبنية على الموافقة.',
          'تقديم شكوى إلى جهة حماية البيانات المختصة.',
        ],
      },
      children: { title: '9. خصوصية الأطفال', p1: 'لا تُوجَّه خدماتنا للأطفال دون 13 عامًا (أو سن الموافقة في بلدك). إذا اعتقدت أننا جمعنا بيانات من طفل، فالرجاء التواصل لطلب الحذف.' },
      security: { title: '10. الأمان', p1: 'نعتمد تدابير تقنية وتنظيمية لحماية بياناتك، ومع ذلك لا توجد وسيلة نقل أو تخزين آمنة تمامًا. لا يمكننا ضمان الأمان المطلق.' },
      thirdparty: { title: '11. روابط وخدمات ال��رف الثالث', p1: 'قد تحتوي خدماتنا على روابط لمواقع أو خدمات طرف ثالث ولسنا مسؤولين عن ممارساتهم ونشجعك على مراجعة سياساتهم.' },
      changes: { title: '12. تغييرات على هذه السياسة', p1: 'قد نحدّث هذه السياسة من وقت لآخر. سيتم نشر التغييرات الجوهرية هنا مع تاريخ "آخر تحديث" جديد. استمرارك في استخدام الخدمات يعني قبولك التحديثات.' },
      contact: { title: '13. تواصل معنا', p1: 'للاستفسارات المتعلقة بالخصوصية أو لممارسة حقوقك: privacy@al‑abraar.com.' },
    },
  },
} as const;

export default PrivacyPage;
