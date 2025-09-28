import React from 'react';
import { BookOpen } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const updated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="bg-white">
      <header className="bg-gradient-to-br from-green-50 to-amber-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center"><BookOpen className="h-6 w-6 text-white"/></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">Last updated: {updated}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 leading-relaxed text-gray-800">
        <section id="introduction" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
          <p>
            Welcome to Al‑Abraar. These Terms of Service (the “Terms”) govern your access to and use of our platform,
            websites, mobile services, and any related services (collectively, the “Services”). By creating an account,
            accessing, or using the Services, you agree to be bound by these Terms and our Privacy Policy.
          </p>
        </section>

        <section id="eligibility" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">2. Eligibility</h2>
          <p>
            You must be at least the age of legal majority in your jurisdiction, or have verifiable consent from a
            parent or legal guardian, to use the Services. By using the Services, you represent and warrant that you
            meet these requirements and that the information you provide is accurate and complete.
          </p>
        </section>

        <section id="accounts" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">3. Accounts and Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to notify us immediately of any unauthorized use of your account.</li>
            <li>We may suspend or terminate accounts that violate these Terms or pose security risks.</li>
          </ul>
        </section>

        <section id="bookings-payments" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">4. Bookings, Payments, and Refunds</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Students may book lessons with teachers (“Ustaadhs”) according to availability displayed on the platform.</li>
            <li>Payments are processed securely by our payment partners (e.g., Stripe). Additional fees and taxes may apply.</li>
            <li>Refunds are assessed in good faith per our policies and applicable law. Certain fees may be non‑refundable.</li>
            <li>No cash handling is permitted outside the platform for booked lessons.</li>
          </ul>
        </section>

        <section id="cancellations" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">5. Cancellations and Rescheduling</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Students and teachers should cancel or reschedule within the platform, subject to posted deadlines.</li>
            <li>Late cancellations or no‑shows may incur charges or affect account standing.</li>
          </ul>
        </section>

        <section id="teacher-obligations" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">6. Teacher Obligations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Teachers must provide accurate profile information and maintain professional conduct at all times.</li>
            <li>Teachers may not solicit off‑platform payments or communications that bypass the Service.</li>
            <li>Teachers are responsible for complying with local laws, tax obligations, and necessary certifications.</li>
          </ul>
        </section>

        <section id="student-obligations" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">7. Student Obligations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Students must provide accurate information and respect teacher availability and policies.</li>
            <li>Students agree not to record, distribute, or share lesson materials without permission.</li>
          </ul>
        </section>

        <section id="acceptable-use" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">8. Acceptable Use and Prohibited Conduct</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>No harassment, hate speech, or abusive behavior.</li>
            <li>No infringement of intellectual property or privacy rights.</li>
            <li>No malware, hacking, scraping, or unauthorized automated access.</li>
            <li>No content that violates applicable laws or community standards.</li>
          </ul>
        </section>

        <section id="ip" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">9. Intellectual Property</h2>
          <p>
            The Services, including all content, software, and trademarks, are owned by or licensed to Al‑Abraar and are
            protected by intellectual property laws. You may not use our marks or content without prior written consent.
          </p>
        </section>

        <section id="disclaimers" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">10. Disclaimers</h2>
          <p>
            The Services are provided “as is” and “as available.” We disclaim all warranties, express or implied,
            including merchantability, fitness for a particular purpose, and non‑infringement. We do not guarantee
            uninterrupted or error‑free operation.
          </p>
        </section>

        <section id="liability" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Al‑Abraar will not be liable for any indirect, incidental, special,
            consequential, or punitive damages; or for lost profits, revenues, data, or goodwill arising from your use of
            or inability to use the Services.
          </p>
        </section>

        <section id="indemnity" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Al‑Abraar and its affiliates from any claims, liabilities, damages,
            losses, and expenses, including legal fees, arising out of or related to your use of the Services or
            violation of these Terms.
          </p>
        </section>

        <section id="law" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">13. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction where Al‑Abraar is established, without regard to
            conflict of law principles. Disputes will be resolved through good‑faith negotiations; if unresolved, they
            shall be submitted to the competent courts of that jurisdiction.
          </p>
        </section>

        <section id="changes" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">14. Changes to the Terms</h2>
          <p>
            We may modify these Terms from time to time. Material changes will be posted on this page with a new “Last
            updated” date. Your continued use of the Services constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section id="contact" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">15. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@al‑abraar.com.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsPage;
