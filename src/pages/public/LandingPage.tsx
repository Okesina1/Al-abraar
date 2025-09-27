import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Star, Shield, Clock, Globe } from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              {t('hero_title_main')}{' '}
              <span className="text-green-600">{t('hero_title_highlight')}</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('hero_description')}
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-base sm:text-lg font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t('hero_cta')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 lg:mt-16">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">{t('feature_quality_title')}</h3>
              <p className="text-gray-600">{t('feature_quality_description')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">{t('feature_flexible_title')}</h3>
              <p className="text-gray-600">{t('feature_flexible_description')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">{t('feature_secure_title')}</h3>
              <p className="text-gray-600">{t('feature_secure_description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 lg:mb-12">
            {t('why_choose_heading')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('why_choose_verified_title')}</h3>
                  <p className="text-gray-600">{t('why_choose_verified_description')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('why_choose_rating_title')}</h3>
                  <p className="text-gray-600">{t('why_choose_rating_description')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('why_choose_global_title')}</h3>
                  <p className="text-gray-600">{t('why_choose_global_description')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 lg:p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('packages_heading')}</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h4 className="font-semibold text-green-600 mb-2">Qur'an & Tajweed</h4>
                  <p className="text-2xl font-bold text-gray-800">$5<span className="text-sm text-gray-600">/hour</span></p>
                  <p className="text-gray-600 text-sm">Perfect for beginners and intermediate learners</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h4 className="font-semibold text-yellow-600 mb-2">Complete Islamic Studies</h4>
                  <p className="text-2xl font-bold text-gray-800">$7<span className="text-sm text-gray-600">/hour</span></p>
                  <p className="text-gray-600 text-sm">Qur'an, Tajweed, Hadeeth & Arabic language</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 lg:py-16 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Begin Your Islamic Learning Journey?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-green-100 mb-8">Join thousands of students learning with verified Islamic teachers worldwide</p>
          <Link
            to="/register"
            className="inline-block bg-white text-green-600 text-base sm:text-lg font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};
