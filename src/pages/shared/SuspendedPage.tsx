import React from 'react';
import { Link } from 'react-router-dom';

export const SuspendedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-6">
      <div className="bg-white rounded-2xl shadow-md max-w-xl w-full p-8 text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Account Suspended</h1>
        <p className="text-gray-700 mb-4">Your account has been suspended. If you believe this is a mistake, please contact our support team at <a href="mailto:support@al-abraar.example" className="text-blue-600">support@al-abraar.example</a>.</p>
        <p className="text-gray-600 mb-6">You will not be able to access your dashboard until your account is re-activated.</p>
        <div className="flex items-center justify-center space-x-3">
          <Link to="/" className="px-4 py-2 bg-gray-100 rounded-lg">Return to home</Link>
          <a href="mailto:support@al-abraar.example" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Contact Support</a>
        </div>
      </div>
    </div>
  );
};
