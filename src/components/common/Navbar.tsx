import React from 'react';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onAuthClick: (view: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Al-Abraar</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onAuthClick('login')}
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onAuthClick('register')}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <UserPlus className="h-5 w-5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};