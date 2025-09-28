import React from 'react';
import { Cookie } from 'lucide-react';

export const CookiePage: React.FC = () => {
  const updated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="bg-white">
      <header className="bg-gradient-to-br from-green-50 to-amber-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center"><Cookie className="h-6 w-6 text-white"/></div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Cookie Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: {updated}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 leading-relaxed text-gray-800">
        <section id="what-are-cookies" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit a website. They help websites
            function properly, remember your preferences, and understand how you interact with content.
          </p>
        </section>

        <section id="ethical-use" className="space-y-4 rounded-xl border border-green-100 bg-green-50/60 p-6">
          <h3 className="text-xl font-semibold text-green-900">Transparency with Taqwa (God-Consciousness)</h3>
          <p>
            We aim to collect and utilize data in a manner that aligns with God-conscious accountability. Every digital
            interaction is treated as a trust, prompting us to explain our use of cookies with clarity and honesty.
          </p>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              “And do not pursue that of which you have no knowledge. Indeed, the hearing, the sight, and the heart—about
              all those [one] will be questioned.”
            </blockquote>
            <figcaption className="text-sm text-gray-600">Qur'an 17:36</figcaption>
          </figure>
          <figure className="space-y-2">
            <blockquote className="text-gray-700 italic">
              “There should be neither harm nor reciprocating harm.”
            </blockquote>
            <figcaption className="text-sm text-gray-600">Prophet Muhammad ﷺ, Sunan Ibn Majah 2341</figcaption>
          </figure>
        </section>

        <section id="how-we-use-cookies" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">2. How We Use Cookies</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-semibold">Essential Cookies:</span> required for core site functionality (e.g., authentication, security).</li>
            <li><span className="font-semibold">Performance Cookies:</span> help us analyze site usage to improve performance and features.</li>
            <li><span className="font-semibold">Functionality Cookies:</span> remember preferences such as language or display settings.</li>
            <li><span className="font-semibold">Analytics Cookies:</span> provide aggregated insights into traffic and user interactions.</li>
            <li><span className="font-semibold">Advertising Cookies:</span> may be used to deliver relevant ads (if applicable) and measure campaign effectiveness.</li>
          </ul>
        </section>

        <section id="third-party-cookies" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">3. Third‑Party Cookies</h2>
          <p>
            We may allow trusted partners to set cookies to provide analytics, advertising, or other services. These
            third parties are responsible for their own cookie practices.
          </p>
        </section>

        <section id="your-choices" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">4. Your Choices</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You can manage or delete cookies through your browser settings.</li>
            <li>You can opt out of certain analytics or advertising cookies via third‑party tools where available.</li>
            <li>Blocking certain cookies may impact site functionality.</li>
          </ul>
        </section>

        <section id="dnt" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">5. Do Not Track</h2>
          <p>
            Some browsers offer a “Do Not Track” (DNT) setting. At this time, we do not respond to DNT signals. We will
            update this Policy if our practices change.
          </p>
        </section>

        <section id="changes" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">6. Changes to this Policy</h2>
          <p>
            We may update this Policy to reflect changes in technology, law, or our practices. Please review this page
            periodically. Your continued use of the Services indicates acceptance of any changes.
          </p>
        </section>

        <section id="contact" className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">7. Contact Us</h2>
          <p>
            For questions about this Cookie Policy, contact us at privacy@al‑abraar.com.
          </p>
        </section>
      </div>
    </main>
  );
};

export default CookiePage;
