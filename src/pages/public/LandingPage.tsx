import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Star,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  GraduationCap,
  MessageCircle,
  CalendarRange,
  CreditCard
} from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 lg:py-24 px-4">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-green-400/20 to-orange-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-green-600/10 to-green-400/10 blur-3xl" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-green-200/60 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">
            <Shield className="h-4 w-4" /> {t('feature_secure_title')}
          </span>

          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            {t('hero_title_main')}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-700">
              {t('hero_title_highlight')}
            </span>
          </h1>

          <p className="mt-5 text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
            {t('hero_description')}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-base sm:text-lg font-semibold py-3 sm:py-3.5 px-6 sm:px-7 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('hero_cta')}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 ring-1 ring-green-200 hover:ring-green-300 hover:bg-green-50 text-base sm:text-lg font-semibold py-3 sm:py-3.5 px-6 sm:px-7 rounded-xl transition-all duration-300"
            >
              <BookOpen className="h-5 w-5" /> Learn More
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/60 backdrop-blur border border-green-100 p-5">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm">{t('stats_students_label')}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">10,000+</p>
            </div>
            <div className="rounded-xl bg-white/60 backdrop-blur border border-green-100 p-5">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <span className="text-sm">{t('stats_ustaadhs_label')}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">300+</p>
            </div>
            <div className="rounded-xl bg-white/60 backdrop-blur border border-green-100 p-5">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="text-sm">{t('stats_countries_label')}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">40+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why + Packages */}
      <section className="py-12 lg:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 lg:mb-12">
            {t('why_choose_heading')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('why_choose_verified_title')}</h3>
                  <p className="text-gray-600">{t('why_choose_verified_description')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('why_choose_rating_title')}</h3>
                  <p className="text-gray-600">{t('why_choose_rating_description')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('why_choose_global_title')}</h3>
                  <p className="text-gray-600">{t('why_choose_global_description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-orange-50 p-6 lg:p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('packages_heading')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
                  <h4 className="font-semibold text-green-700 mb-1">{t('packages_quran_title')}</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {t('packages_quran_price')}
                    <span className="text-sm text-gray-600 ltr:ml-2 rtl:mr-2">{t('packages_price_suffix')}</span>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{t('packages_quran_description')}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100">
                  <h4 className="font-semibold text-orange-700 mb-1">{t('packages_complete_title')}</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {t('packages_complete_price')}
                    <span className="text-sm text-gray-600 ltr:ml-2 rtl:mr-2">{t('packages_price_suffix')}</span>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{t('packages_complete_description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-10 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h3 className="text-2xl font-bold">{t('trust_heading')}</h3>
          <p className="mt-1 text-green-100">{t('trust_subheading')}</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Shield className="h-5 w-5" /> SSL
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <CreditCard className="h-5 w-5" /> Stripe
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <CheckCircle className="h-5 w-5" /> KYC
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <MessageCircle className="h-5 w-5" /> Support
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 lg:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10">
            {t('how_heading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-green-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Search className="hidden" />
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">{t('how_step1_title')}</h4>
              <p className="text-gray-600 mt-1">{t('how_step1_description')}</p>
            </div>
            <div className="bg-white border border-orange-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                <CalendarRange className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">{t('how_step2_title')}</h4>
              <p className="text-gray-600 mt-1">{t('how_step2_description')}</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">{t('how_step3_title')}</h4>
              <p className="text-gray-600 mt-1">{t('how_step3_description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 lg:py-16 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10">
            {t('testimonials_heading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="mt-3 text-gray-700">“{t('testimonial_1_quote')}”</p>
              <div className="mt-4 text-sm text-gray-500">
                {t('testimonial_1_name')} • {t('testimonial_1_country')}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="mt-3 text-gray-700">“{t('testimonial_2_quote')}”</p>
              <div className="mt-4 text-sm text-gray-500">
                {t('testimonial_2_name')} • {t('testimonial_2_country')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-12 lg:py-16 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">{t('cta_heading')}</h2>
          <p className="text-base sm:text-lg lg:text-xl text-green-100 mb-8">{t('cta_subheading')}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-white text-green-700 hover:text-green-800 hover:bg-green-50 text-base sm:text-lg font-semibold py-3 sm:py-3.5 px-6 sm:px-7 rounded-xl transition-all duration-300 shadow-lg"
            >
              {t('cta_primary')}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/15 text-base sm:text-lg font-semibold py-3 sm:py-3.5 px-6 sm:px-7 rounded-xl transition-all duration-300"
            >
              <Clock className="h-5 w-5" /> Book a lesson
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
