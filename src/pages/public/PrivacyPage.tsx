import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const updated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="bg-white">
      <header className="bg-gradient-to-br from-green-50 to-amber-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center"><Shield className="h-6 w-6 text-white"/></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: {updated}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 leading-relaxed text-gray-800">
        <section id="overview" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">1. Overview</h2>
          <p>
            This Privacy Policy explains how Al‑Abraar collects, uses, discloses, and safeguards your information when
            you use our Services. By using the Services, you consent to the practices described in this Policy.
          </p>
        </section>

        <section id="privacy-ethic" className="space-y-4 rounded-xl border border-green-100 bg-green-50/60 p-6">
          <h3 className="text-xl font-semibold text-green-900">An Amanah (Trust) We Safeguard</h3>
          <p>
            Respecting your privacy is more than a legal duty—it is a trust entrusted to us by Allah ﷻ and reinforced by
            the teachings of His Messenger ﷺ. We strive to prevent intrusive data practices and foster a safe learning
            environment grounded in compassion and integrity.
          </p>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              “O you who have believed, avoid much suspicion. Indeed, some suspicion is sin. And do not spy or backbite
              one another.”
            </blockquote>
            <figcaption className="text-sm text-gray-600">Qur'an 49:12</figcaption>
          </figure>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              “When a person tells you something and then leaves, it is a trust.”
            </blockquote>
            <figcaption className="text-sm text-gray-600">Prophet Muhammad ﷺ, Sunan Abi Dawud 4869</figcaption>
          </figure>
        </section>

        <section id="data-we-collect" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-semibold">Account Information:</span> name, email, password, role, profile details.</li>
            <li><span className="font-semibold">Booking and Payment Data:</span> schedule selections, payment metadata (processed by payment providers).</li>
            <li><span className="font-semibold">Communications:</span> messages, support requests, feedback.</li>
            <li><span className="font-semibold">Usage Data:</span> device, browser, pages viewed, actions taken, IP address, and approximate location.</li>
            <li><span className="font-semibold">Cookies and Similar Technologies:</span> as described in our Cookie Policy.</li>
          </ul>
        </section>

        <section id="how-we-use" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">3. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, secure, and improve the Services.</li>
            <li>Facilitate bookings, payments, and communications.</li>
            <li>Personalize content and recommend relevant teachers or materials.</li>
            <li>Comply with legal obligations and prevent fraud or abuse.</li>
            <li>Communicate with you about updates, security alerts, and support.</li>
          </ul>
        </section>

        <section id="legal-bases" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">4. Legal Bases for Processing</h2>
          <p>
            Where applicable (e.g., in the EEA/UK), we process personal data under legal bases including consent,
            contract performance, legitimate interests, legal obligations, and protection of vital interests.
          </p>
        </section>

        <section id="sharing" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">5. How We Share Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>With service providers (e.g., hosting, analytics, payment processing) under appropriate safeguards.</li>
            <li>With teachers and students as necessary to deliver the Services (e.g., booking details).</li>
            <li>For legal reasons, to protect rights, safety, and prevent harm or fraud.</li>
            <li>In connection with business transfers, subject to confidentiality and notice obligations.</li>
          </ul>
        </section>

        <section id="transfers" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">6. International Data Transfers</h2>
          <p>
            We may transfer, store, and process information in countries other than your own. Where required, we use
            appropriate safeguards such as Standard Contractual Clauses.
          </p>
        </section>

        <section id="retention" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">7. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary to fulfill the purposes outlined in this Policy, comply with
            our legal obligations, resolve disputes, and enforce agreements.
          </p>
        </section>

        <section id="your-rights" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">8. Your Rights</h2>
          <p>Depending on your location, your rights may include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access, correction, deletion, and portability of your data.</li>
            <li>Objection to or restriction of certain processing.</li>
            <li>Withdrawal of consent where processing is based on consent.</li>
            <li>Filing a complaint with your local data protection authority.</li>
          </ul>
        </section>

        <section id="children" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">9. Children’s Privacy</h2>
          <p>
            Our Services are not directed to children under the age of 13 (or the age of consent in your jurisdiction).
            If you believe we have collected data from a child, please contact us to request deletion.
          </p>
        </section>

        <section id="security" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">10. Security</h2>
          <p>
            We implement technical and organizational measures to protect your data; however, no method of transmission
            or storage is completely secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section id="third-parties" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">11. Third‑Party Links and Services</h2>
          <p>
            Our Services may contain links to third‑party sites or services. We are not responsible for their privacy
            practices. We encourage you to review their policies.
          </p>
        </section>

        <section id="changes" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">12. Changes to this Policy</h2>
          <p>
            We may update this Policy from time to time. Material changes will be posted on this page with a new “Last
            updated” date. Continued use of the Services indicates acceptance of the updated Policy.
          </p>
        </section>

        <section id="contact" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">13. Contact Us</h2>
          <p>
            For privacy inquiries or to exercise your rights, contact us at privacy@al‑abraar.com.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPage;
