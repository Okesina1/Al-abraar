import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CreditCard,
  Search,
  Play,
  ArrowRight,
  Award,
  Heart,
  Zap,
  Target
} from 'lucide-react';
import { useI18n } from '../../contexts/LanguageContext';
import { UstaadhCard } from '../../components/student/UstaadhCard';
import { User } from '../../types';
import { usersApi, settingsApi } from '../../utils/api';

export const LandingPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [ustaadhs, setUstaadhs] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<{ basic: number; complete: number } | null>(null);
  const [teachersCount, setTeachersCount] = useState<number | null>(null);
  const [publicStats, setPublicStats] = useState<{ activeStudents?: number; countries?: number; avgRating?: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ustaadhsRes, settingsRes] = await Promise.all([
          usersApi.getApprovedUstaadhss({ limit: '12' }),
          settingsApi.getSettings(),
        ]);

        const list = Array.isArray(ustaadhsRes?.ustaadhs)
          ? ustaadhsRes.ustaadhs
          : Array.isArray(ustaadhsRes)
          ? ustaadhsRes
          : Array.isArray(ustaadhsRes?.data)
          ? ustaadhsRes.data
          : [];

        if (!isMounted) return;

        setUstaadhs(
          list.map((u: any) => ({
            ...u,
            id: u.id || u._id || u.userId,
          }))
        );
        if (typeof ustaadhsRes?.total === 'number') {
          setTeachersCount(ustaadhsRes.total);
        } else if (Array.isArray(list)) {
          setTeachersCount(list.length);
        }

        const pricingFromSettings = (settingsRes as any)?.pricing;
        if (pricingFromSettings && typeof pricingFromSettings.basic === 'number' && typeof pricingFromSettings.complete === 'number') {
          setPricing(pricingFromSettings);
        }

        const statsFromSettings = (settingsRes as any)?.publicStats || (settingsRes as any)?.marketingStats || (settingsRes as any)?.platformStats;
        if (statsFromSettings && typeof statsFromSettings === 'object') {
          setPublicStats({
            activeStudents: typeof statsFromSettings.activeStudents === 'number' ? statsFromSettings.activeStudents : undefined,
            countries: typeof statsFromSettings.countries === 'number' ? statsFromSettings.countries : undefined,
            avgRating: typeof statsFromSettings.avgRating === 'number' ? statsFromSettings.avgRating : undefined,
          });
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Failed to load data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = ustaadhs
    .filter((u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      (u.specialties || []).some((s) => s.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 3);

  const handleBook = () => navigate('/login');
  const handleMessage = () => navigate('/login');

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section - Image Collage */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-green-100 mb-6 animate-fade-in">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">{t('hero_trust_badge')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 animate-fade-in-up">
                {t('hero_title_prefix')}
                <span className="block bg-gradient-to-r from-green-600 via-green-700 to-amber-600 bg-clip-text text-transparent">{t('hero_title_highlight_v2')}</span>
                {t('hero_title_suffix')}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
                {t('hero_description_v2')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-400">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center px-7 py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('cta_start_learning')}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <button className="group inline-flex items-center justify-center px-7 py-4 text-base sm:text-lg font-semibold text-gray-700 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-green-300 transition-all duration-300">
                  <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <Play className="h-6 w-6 text-green-600 ml-1" />
                  </div>
                  {t('cta_watch_demo')}
                </button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                {publicStats?.activeStudents !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{publicStats.activeStudents.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t('stats_active_students')}</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{teachersCount !== null ? teachersCount.toLocaleString() : '—'}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{t('stats_expert_teachers')}</div>
                </div>
                {publicStats?.countries !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{publicStats.countries.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t('stats_countries')}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Collage */}
            <div className="relative">
              {/* Floating icons */}
              <div className="pointer-events-none">
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center animate-float">
                  <BookOpen className="h-7 w-7 text-green-600" />
                </div>
                <div className="absolute -bottom-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center animate-float animation-delay-1000">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 grid-rows-6 gap-4 sm:gap-5">
                <div className="col-span-2 row-span-4 relative">
                  <img
                    src="https://images.pexels.com/photos/8164722/pexels-photo-8164722.jpeg"
                    alt="A Muslim girl in hijab sitting indoors, reading Quran during Ramadan. Peaceful religious moment."
                    className="w-full h-full object-cover rounded-2xl shadow-2xl"
                    loading="eager"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5"></div>
                </div>
                <div className="col-span-1 row-span-3 relative">
                  <img
                    src="https://images.pexels.com/photos/7427800/pexels-photo-7427800.jpeg"
                    alt="Close-up of detailed Arabic calligraphy in traditional Islamic wall decor with rich gold and black patterns."
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                    loading="lazy"
                  />
                </div>
                <div className="col-span-1 row-span-3 relative">
                  <img
                    src="https://images.pexels.com/photos/7261978/pexels-photo-7261978.jpeg"
                    alt="A close-up of hands holding an open Quran on a wooden table, showcasing Arabic script."
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                    loading="lazy"
                  />
                </div>
                <div className="col-span-2 row-span-2 relative">
                  <img
                    src="https://images.pexels.com/photos/7593802/pexels-photo-7593802.jpeg"
                    alt="Young man in casual attire attentively participating in an online class from home."
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                    loading="lazy"
                  />
                </div>
                <div className="col-span-3 row-span-1 relative">
                  <img
                    src="https://images.pexels.com/photos/4491461/pexels-photo-4491461.jpeg"
                    alt="A professional woman engaged in a virtual meeting setup at her home desk, using a computer and camera."
                    className="w-full h-28 sm:h-32 lg:h-full object-cover rounded-2xl shadow-xl"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-white"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('why_choose_heading')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('why_choose_subheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('feature_verified_excellence_title')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('feature_verified_excellence_description')}
                </p>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors">
                  <span>{t('feature_learn_more')}</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('feature_flexible_learning_title')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('feature_flexible_learning_description')}
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  <span>{t('feature_explore_scheduling')}</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('feature_global_community_title')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('feature_global_community_description')}
                </p>
                <div className="flex items-center text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
                  <span>{t('feature_join_community')}</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Packages - Redesigned */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('packages_heading_v2')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('packages_subheading_v2')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Package */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{t('packages_quran_title')}</h3>
                      <p className="text-green-600 font-medium">{t('packages_foundation_label')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-green-600">${pricing ? pricing.basic : 5}</div>
                    <div className="text-gray-500 text-sm">{t('per_hour')}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_quran_b1')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_quran_b2')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_quran_b3')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_quran_b4')}</span>
                  </div>
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  {t('packages_start_foundation')}
                </button>
              </div>
            </div>

            {/* Complete Package */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-green-600 to-amber-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {t('most_popular_badge')}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{t('packages_complete_title')}</h3>
                      <p className="text-amber-600 font-medium">{t('packages_comprehensive_label')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-amber-600">${pricing ? pricing.complete : 7}</div>
                    <div className="text-gray-500 text-sm">{t('per_hour')}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_complete_b1')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_complete_b2')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_complete_b3')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_complete_b4')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('pkg_complete_b5')}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  {t('packages_choose_complete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Redesigned */}
      <section className="py-20 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('how_heading_v2')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('how_subheading_v2')}
            </p>
          </div>

          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-amber-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              {/* Step 1 */}
              <div className="relative text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <Search className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-green-600">1</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('how_step1_title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('how_step1_description')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <CalendarRange className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('how_step2_title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('how_step2_description')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center group">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                    <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-amber-600">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('how_step3_title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('how_step3_description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-green-50/50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('teachers_heading')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {t('teachers_subheading')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((ustaadh) => (
              <div key={ustaadh.id} className="transform hover:scale-105 transition-transform duration-300">
                <UstaadhCard
                  ustaadh={ustaadh}
                  onBook={handleBook}
                  onMessage={handleMessage}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/student/browse" 
              className="inline-flex items-center px-8 py-4 bg-white text-green-700 rounded-2xl shadow-lg hover:shadow-xl border-2 border-green-200 hover:border-green-300 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <span>{t('browse_all_ustaadhs')}</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Redesigned */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/10 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('testimonials_heading_v2')}
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              {t('testimonials_subheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{t('testimonial_1_quote')}"
              </p>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop" 
                  alt="Sarah A." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{t('testimonial_1_name')}</div>
                  <div className="text-sm text-gray-600">{t('student_from_canada')}</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{t('testimonial_2_quote')}"
              </p>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop" 
                  alt="Omar R." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{t('testimonial_2_name')}</div>
                  <div className="text-sm text-gray-600">{t('student_from_uae')}</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{t('testimonial_3_quote')}"
              </p>
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop" 
                  alt="Aisha M." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{t('testimonial_3_name', 'Aisha M.')}</div>
                  <div className="text-sm text-gray-600">{t('student_from_malaysia')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 lg:py-32 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built on <span className="text-green-600">Trust & Excellence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your security and learning experience are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">Bank-level encryption with Stripe</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certified Teachers</h3>
              <p className="text-gray-600 text-sm">Verified credentials and experience</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors duration-300">
                <Heart className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Always here to help you succeed</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-300">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor your learning journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Redesigned */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            <span>{t('cta_badge_text')}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('cta_heading_prefix')}
            <span className="block bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent">
              {t('cta_heading_suffix')}
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            {t('cta_paragraph_v2')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-gray-900 bg-gradient-to-r from-green-400 to-amber-400 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t('cta_get_started_free')}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-white bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="h-6 w-6 mr-3" />
              {t('cta_book_consultation')}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">4.9★</div>
              <div className="text-sm text-gray-400">{t('avg_rating')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-gray-400">{t('lessons_completed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-gray-400">{t('success_rate')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-gray-400">{t('support_available')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-amber-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold">{t('brand_name')}</span>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md mb-6">
                {t('footer_brand_blurb')}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">{t('badge_verified_teachers')}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-400">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">{t('badge_secure_platform')}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">{t('footer_quick_links')}</h4>
              <ul className="space-y-3">
                <li><Link to="/student/browse" className="text-gray-300 hover:text-green-400 transition-colors">{t('link_browse_teachers')}</Link></li>
                <li><Link to="/register" className="text-gray-300 hover:text-green-400 transition-colors">{t('link_sign_up')}</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-green-400 transition-colors">{t('link_sign_in')}</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors">{t('link_how_it_works')}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6">{t('footer_contact_heading')}</h4>
              <ul className="space-y-3">
                <li className="text-gray-300">support@al-abraar.com</li>
                <li className="text-gray-300">+1 (555) 123-4567</li>
                <li className="text-gray-300">{t('footer_available_247')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} {t('brand_name')}. {t('footer_rights')}
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/terms" className="text-gray-400 hover:text-green-400 transition-colors">{t('terms_of_service')}</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">{t('privacy_policy')}</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-green-400 transition-colors">{t('cookie_policy')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
