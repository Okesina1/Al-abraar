import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useI18n, type Lang } from '../../contexts/LanguageContext';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { t, lang, setLang } = useI18n();

  const changeLanguage = (nextLang: Lang) => {
    if (nextLang !== lang) {
      setLang(nextLang);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-800">{t('brand_name')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-md border border-gray-200">
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 text-xs sm:text-sm font-medium transition-colors ${
                    lang === 'en' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-pressed={lang === 'en'}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('ar')}
                  className={`px-2 py-1 text-xs sm:text-sm font-medium transition-colors ${
                    lang === 'ar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-pressed={lang === 'ar'}
                >
                  AR
                </button>
              </div>
              {location.pathname !== '/login' && (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('nav_sign_in')}</span>
                </Link>
              )}
              {location.pathname !== '/register' && (
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('nav_register')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};
