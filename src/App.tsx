import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UstaadhDashboard } from './components/ustaadh/UstaadhDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { Landing } from './components/common/Landing';
import { Navbar } from './components/common/Navbar';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register'>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Navbar onAuthClick={setCurrentView} />
        {currentView === 'landing' && <Landing onGetStarted={() => setCurrentView('register')} />}
        {currentView === 'login' && <Login onSwitchToRegister={() => setCurrentView('register')} />}
        {currentView === 'register' && <Register onSwitchToLogin={() => setCurrentView('login')} />}
      </div>
    );
  }

  // Render role-based dashboards
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'ustaadh':
      return <UstaadhDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MessagingProvider>
          <AppContent />
        </MessagingProvider>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;